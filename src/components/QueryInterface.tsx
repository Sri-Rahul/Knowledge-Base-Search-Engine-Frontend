import { useState, useRef, useEffect, useMemo } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import {
  Send,
  Loader2,
  FileText,
  Sparkles,
  Clipboard,
  Check,
  Share2,
  AlertCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark-dimmed.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { api, APIError } from "@/services/api";
import type { RetrievedChunk } from "@/types/api";

type AnswerSection = {
  heading: string;
  content: string;
};

function parseSections(markdown: string): AnswerSection[] {
  if (!markdown.trim()) return [];

  const headingRegex = /^##\s+(.+)$/gm;
  const matches: Array<{ title: string; index: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    matches.push({ title: match[1].trim(), index: match.index });
  }

  if (matches.length === 0) {
    return [
      {
        heading: "Answer",
        content: markdown,
      },
    ];
  }

  const sections: AnswerSection[] = [];
  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const headingLineEnd = markdown.indexOf("\n", current.index);
    const start = headingLineEnd === -1 ? markdown.length : headingLineEnd + 1;
    const end = next ? next.index : markdown.length;
    const content = markdown.slice(start, end).trim();
    sections.push({ heading: current.title, content });
  }

  return sections;
}

const markdownComponents: Components = {
  li({ children }: { children?: ReactNode }) {
    return <li className="leading-relaxed text-muted-foreground">{children}</li>;
  },
  code({ inline, className, children, ...props }: HTMLAttributes<HTMLElement> & { inline?: boolean; className?: string; children?: ReactNode }) {
    const text = String(children ?? "").trim();
    if (inline) {
      return (
        <code className="rounded-md bg-secondary px-1.5 py-0.5 text-[0.75rem] text-primary" {...props}>
          {text}
        </code>
      );
    }

    const languageMatch = /language-(\w+)/.exec(className || "");
    return (
      <pre className={`mt-3 overflow-x-auto rounded-xl bg-secondary/80 p-3 text-xs ${className || ""}`}>
        <code className={languageMatch ? `language-${languageMatch[1]}` : ""} {...props}>
          {text}
        </code>
      </pre>
    );
  },
};

export function QueryInterface() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<RetrievedChunk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(() => parseSections(answer), [answer]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleShare = async () => {
    if (!navigator.share) {
      setShareError("Sharing is not supported in this browser.");
      setTimeout(() => setShareError(null), 3000);
      return;
    }

    try {
      await navigator.share({
        title: "Knowledge Base Response",
        text: answer,
      });
    } catch (err) {
      console.error("Share cancelled", err);
    }
  };

  // Auto-scroll to answer
  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [answer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setAnswer("");
      setSources([]);
      setProcessingTime(null);
      setShareError(null);

      // Use streaming API
      let fullAnswer = "";
      const startedAt = performance.now();

      for await (const event of api.queryStream({ query: query.trim(), top_k: 5 })) {
        if (event.type === "sources") {
          setSources(event.data);
        } else if (event.type === "answer") {
          fullAnswer += event.data;
          setAnswer(fullAnswer);
        } else if (event.type === "done") {
          const elapsed = (performance.now() - startedAt) / 1000;
          setProcessingTime(elapsed);
        } else if (event.type === "error") {
          setError(event.data);
        }
      }
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.detail || err.message);
      } else {
        setError("Failed to process query");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-panel animate-scale-in rounded-3xl border border-border/70">
        <CardContent className="space-y-5 p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ask anything</p>
              <h3 className="text-xl font-semibold">Query your knowledge base</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Shift + Enter → new line · Enter → submit
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="E.g. Summarise Q3 revenue learnings by product line and list supporting evidence."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="min-h-[140px] resize-none rounded-2xl border border-border/80 bg-background/70 pr-14 text-sm shadow-inner focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/40"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !query.trim()}
                className="absolute bottom-4 right-4 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          {shareError && (
            <div className="flex items-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{shareError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {answer && (
        <Card ref={answerRef} className="glass-panel animate-fade-in rounded-3xl border border-border/70">
          <CardContent className="space-y-5 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Synthesised answer</h3>
                  {processingTime && (
                    <p className="text-xs text-muted-foreground">
                      Generated in {processingTime.toFixed(2)}s
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full border-border/70 bg-background"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {sections.map((section) => (
                <details
                  key={section.heading}
                  className="group rounded-2xl border border-border/70 bg-background/70 p-4 open:border-primary/40"
                  open={section.heading === "Summary"}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-foreground">{section.heading}</h4>
                    <span className="text-xs text-muted-foreground transition-transform group-open:-rotate-180">▾</span>
                  </summary>
                  <div className="markdown-content prose prose-sm mt-3 max-w-none dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={markdownComponents}
                    >
                      {section.content}
                    </ReactMarkdown>
                  </div>
                </details>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {sources.length > 0 && (
        <Card className="glass-panel animate-fade-in rounded-3xl border border-border/70">
          <CardContent className="space-y-5 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Source traces</h3>
                <p className="text-xs text-muted-foreground">Confidence scored per chunk · higher is better</p>
              </div>
            </div>
            <div className="space-y-3">
              {sources.map((source, index) => {
                const similarity = Math.max(0, Math.min(1, source.similarity_score ?? 0));
                const percent = Math.round(similarity * 100);
                return (
                  <div
                    key={`${source.metadata.document_id}-${source.metadata.chunk_index}-${index}`}
                    className="rounded-2xl border border-border/70 bg-background/70 p-4 transition-smooth hover:border-primary/40"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {source.metadata.source} · Chunk {Number(source.metadata.chunk_index) + 1}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Document ID: {source.metadata.document_id?.slice(0, 8) ?? "n/a"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                        <span>{percent}% match</span>
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-accent"
                            style={{ width: `${Math.min(Math.max(percent, 6), 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <details className="mt-3 cursor-pointer rounded-xl border border-transparent bg-secondary/40 px-3 py-2 text-sm text-muted-foreground transition-smooth hover:border-primary/30">
                      <summary className="flex list-none items-center justify-between text-xs font-medium text-muted-foreground">
                        View snippet
                        <span className="text-muted-foreground">▾</span>
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                        {source.content}
                      </p>
                    </details>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
