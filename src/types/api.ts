export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  document_id: string;
  filename: string;
  chunks_created: number;
}

export interface QueryRequest {
  query: string;
  top_k?: number;
  stream?: boolean;
}

export interface RetrievedChunk {
  content: string;
  metadata: Record<string, any>;
  similarity_score: number;
}

export interface QueryResponse {
  query: string;
  answer: string;
  sources: RetrievedChunk[];
  processing_time: number;
}

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  chromadb_status: string;
  embedding_model: string;
}

export interface ErrorResponse {
  error: string;
  detail?: string;
  status_code: number;
}
