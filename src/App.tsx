import { useEffect, useState } from "react";
import {
  BookOpen,
  Database,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
} from "lucide-react";
import { DocumentUpload } from "@/components/DocumentUpload";
import { QueryInterface } from "@/components/QueryInterface";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
import type { HealthResponse } from "@/types/api";
import { ThemeToggle } from "@/components/ThemeToggle";

const featureCards = [
  {
    icon: <BookOpen className="h-5 w-5 text-primary" />,
    title: "Semantic ingestion",
    description: "Upload PDFs or text, automatically chunked with smart overlaps for context retention.",
  },
  {
    icon: <Zap className="h-5 w-5 text-primary" />,
    title: "Hyperspeed retrieval",
    description: "ChromaDB + Groq pair for lightning-fast similarity search across your knowledge base.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-primary" />,
    title: "Context-first answers",
    description: "LLM outputs remain grounded in your documents with transparent citations every time.",
  },
];

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    // Check API health on mount
    const checkHealth = async () => {
      try {
        const response = await api.checkHealth();
        setHealth(response);
      } catch (error) {
        console.error("Failed to connect to API:", error);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-3xl" />
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.38em] text-muted-foreground">Knowledge Engine</p>
              <h1 className="text-lg font-semibold text-gradient">Aurora RAG Studio</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {health && (
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span className={`h-2 w-2 rounded-full ${health.status === "healthy" ? "bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]" : "bg-destructive"}`} />
                <span>{health.chromadb_status === "healthy" ? "Realtime" : "Offline"}</span>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <span className="text-sm">Checking backend health...</span>
            </div>
          </div>
        ) : !health || health.status !== "healthy" ? (
          <Card className="glass-panel mx-auto max-w-3xl border-destructive/40">
            <CardContent className="space-y-4 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <Database className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-semibold">Unable to reach the backend</h2>
              <p className="text-sm text-muted-foreground">
                Ensure the FastAPI server is running locally or that the deployment URL is reachable.
              </p>
              <code className="inline-flex items-center justify-center rounded-full bg-secondary px-4 py-2 text-xs font-medium text-muted-foreground">
                {apiUrl}
              </code>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Retrieval-Augmented Intelligence
                </span>
                <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                  Discover the signal hidden across your knowledge base.
                </h2>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Upload internal content, run semantic queries, and stream grounded answers formatted for action. Aurora pairs Groq’s speed with precise ChromaDB retrieval to feel like your own in-house researcher.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {featureCards.map((feature) => (
                    <div key={feature.title} className="glass-panel glow-ring h-full rounded-2xl p-4 text-left transition-transform hover:-translate-y-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                        {feature.icon}
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-panel relative overflow-hidden rounded-3xl p-6">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/25 via-transparent to-transparent" />
                <div className="relative flex flex-col gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Pipeline status</p>
                    <div className="mt-3 flex items-center gap-3 text-sm font-medium text-foreground">
                      <Layers className="h-4 w-4 text-primary" />
                      End-to-end flow ready
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Embeddings, vector storage, and Groq LLM are online. Upload to begin building your private corpus.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                      <p className="text-xs text-muted-foreground">Embedding model</p>
                      <p className="font-semibold text-primary">{health.embedding_model}</p>
                    </div>
                    <div className="rounded-2xl border border-secondary/60 bg-secondary/50 p-4">
                      <p className="text-xs text-muted-foreground">Environment</p>
                      <p className="font-semibold text-foreground">{health.environment}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] xl:gap-12">
              <DocumentUpload />
              <QueryInterface />
            </section>
          </>
        )}
      </main>

      <footer className="relative z-10 mt-20 border-t border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row">
          <p>FastAPI · ChromaDB · Groq · React · Tailwind CSS</p>
          <span className="font-medium text-muted-foreground/80">© {new Date().getFullYear()} Aurora RAG Studio</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

