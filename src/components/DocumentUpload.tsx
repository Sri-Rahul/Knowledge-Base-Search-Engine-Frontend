import { useMemo, useState } from "react";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, APIError } from "@/services/api";

export function DocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<
    Array<{ id: string; name: string; chunks: number }>
  >([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const chunks = uploadedDocs.reduce((acc, item) => acc + item.chunks, 0);
    return {
      documents: uploadedDocs.length,
      chunks,
    };
  }, [uploadedDocs]);

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const response = await api.uploadDocument(file);

      setUploadedDocs((prev) => [
        ...prev,
        {
          id: response.document_id,
          name: response.filename,
          chunks: response.chunks_created,
        },
      ]);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.detail || err.message);
      } else {
        setError("Failed to upload document");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <Card className="glass-panel animate-slide-in rounded-3xl border border-border/70 p-0 shadow-xl">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Corpus builder</p>
            <h3 className="mt-2 text-xl font-semibold">Upload your documents</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Drop PDFs or text files. We’ll clean, chunk, embed, and push them to your private vector store.
            </p>
          </div>
          {stats.documents > 0 ? (
            <div className="hidden rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2 text-right sm:flex sm:flex-col">
              <span className="text-xs text-muted-foreground">Knowledge graph</span>
              <span className="text-sm font-semibold text-primary">{stats.documents} docs · {stats.chunks} chunks</span>
            </div>
          ) : null}
        </div>

        <div
          className={`glow-ring relative mt-6 grid place-items-center rounded-3xl border border-dashed border-border/80 bg-secondary/40 p-10 text-center transition-smooth ${
            dragActive ? "border-primary bg-primary/10" : "hover:border-primary/40"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.txt"
            onChange={handleFileInput}
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <p className="text-sm font-medium text-primary">Uploading...</p>
              <p className="text-xs text-muted-foreground">Please keep the tab open while we process the file.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background shadow-sm">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                <span>Drag & drop to ingest instantly</span>
                <span>or</span>
              </div>
              <Button asChild variant="secondary" size="sm" className="rounded-full px-6">
                <label htmlFor="file-upload" className="cursor-pointer font-medium">
                  Browse files
                </label>
              </Button>
              <p className="text-xs text-muted-foreground/80">
                PDF · TXT · max 10MB per file
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                best practice
              </p>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>• Prefer clean source docs over images or scans.</li>
                <li>• Split oversized PDFs before upload to keep chunk quality high.</li>
                <li>• Re-upload to refresh embeddings after document edits.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Formats</p>
              <p className="mt-2 text-sm font-medium text-foreground">Automatic cleaning & semantic chunking</p>
              <p className="mt-1 text-xs text-muted-foreground">
                We preserve paragraph context with 20% overlap so the LLM can cite accurately.
              </p>
            </div>
          </div>

          {uploadedDocs.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Latest ingested files</h4>
              <div className="space-y-3">
                {uploadedDocs
                  .slice()
                  .reverse()
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="group rounded-2xl border border-border/60 bg-secondary/40 p-4 transition-smooth hover:-translate-y-1 hover:border-primary/40"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileText className="h-[18px] w-[18px]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.chunks} semantic chunks generated</p>
                          </div>
                        </div>
                        <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                          ready
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
