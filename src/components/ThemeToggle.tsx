import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEME_STORAGE_KEY = "kb-rag-theme";

type ThemeMode = "light" | "dark";

function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getPreferredTheme());

  useEffect(() => {
    applyTheme(mode);
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (event: MediaQueryListEvent) => {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (!stored) {
        setMode(event.matches ? "dark" : "light");
      }
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const toggle = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="relative h-9 w-9 rounded-full border border-border shadow-sm hover:border-primary/60 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/40 transition-smooth"
      onClick={toggle}
      aria-label={`Switch to ${mode === "light" ? "dark" : "light"} theme`}
    >
      <SunMedium
        className={`absolute h-4 w-4 text-primary transition-all duration-300 ${
          mode === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <MoonStar
        className={`absolute h-4 w-4 text-primary transition-all duration-300 ${
          mode === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </Button>
  );
}
