import type {
  DocumentUploadResponse,
  QueryRequest,
  QueryResponse,
  HealthResponse,
} from "@/types/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

class APIError extends Error {
  status: number;
  detail?: string;
  
  constructor(
    message: string,
    status: number,
    detail?: string
  ) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.detail = detail;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Unknown error",
      detail: response.statusText,
    }));
    throw new APIError(
      error.error || "API Error",
      response.status,
      error.detail
    );
  }
  return response.json();
}

export const api = {
  // Health check
  async checkHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<HealthResponse>(response);
  },

  // Upload document
  async uploadDocument(file: File): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      body: formData,
    });

    return handleResponse<DocumentUploadResponse>(response);
  },

  // Query (non-streaming)
  async query(request: QueryRequest): Promise<QueryResponse> {
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    return handleResponse<QueryResponse>(response);
  },

  // Query (streaming)
  async* queryStream(
    request: QueryRequest
  ): AsyncGenerator<
    { type: "sources" | "answer" | "done" | "error"; data: any },
    void,
    unknown
  > {
    const response = await fetch(`${API_BASE_URL}/query/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "Unknown error",
      }));
      throw new APIError(error.error || "API Error", response.status);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            yield data;
            if (data.type === "done" || data.type === "error") {
              return;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  // Delete document
  async deleteDocument(documentId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: "DELETE",
    });

    return handleResponse<{ success: boolean; message: string }>(response);
  },
};

export { APIError };
