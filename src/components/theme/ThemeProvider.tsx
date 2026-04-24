import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeMode = "dark" | "light" | "system";
export type AccentColor = "cyan" | "violet" | "emerald" | "amber" | "rose";

interface AccentDef {
  id: AccentColor;
  label: string;
  // HSL triplets (no hsl() wrapper) — written into CSS vars
  primary: string;
  primaryGlow: string;
  ring: string;
  swatch: string;
}

export const ACCENTS: AccentDef[] = [
  { id: "cyan",    label: "Cyan",    primary: "185 85% 58%", primaryGlow: "185 100% 70%", ring: "185 85% 58%", swatch: "hsl(185 85% 58%)" },
  { id: "violet",  label: "Violet",  primary: "265 80% 65%", primaryGlow: "265 95% 78%", ring: "265 80% 65%", swatch: "hsl(265 80% 65%)" },
  { id: "emerald", label: "Emerald", primary: "155 75% 50%", primaryGlow: "155 90% 62%", ring: "155 75% 50%", swatch: "hsl(155 75% 50%)" },
  { id: "amber",   label: "Amber",   primary: "38 92% 55%",  primaryGlow: "38 100% 68%", ring: "38 92% 55%",  swatch: "hsl(38 92% 55%)" },
  { id: "rose",    label: "Rose",    primary: "340 80% 60%", primaryGlow: "340 95% 72%", ring: "340 80% 60%", swatch: "hsl(340 80% 60%)" },
];

interface ThemeCtx {
  mode: ThemeMode;
  resolved: "dark" | "light";
  accent: AccentColor;
  setMode: (m: ThemeMode) => void;
  setAccent: (a: AccentColor) => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

const STORAGE_MODE = "openclaw.theme.mode";
const STORAGE_ACCENT = "openclaw.theme.accent";

function getSystemPref(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem(STORAGE_MODE) as ThemeMode) || "dark";
  });
  const [accent, setAccentState] = useState<AccentColor>(() => {
    if (typeof window === "undefined") return "cyan";
    return (localStorage.getItem(STORAGE_ACCENT) as AccentColor) || "cyan";
  });
  const [resolved, setResolved] = useState<"dark" | "light">(() =>
    mode === "system" ? getSystemPref() : (mode as "dark" | "light")
  );

  // Resolve mode -> dark/light (and listen to system changes)
  useEffect(() => {
    const apply = () => {
      const r = mode === "system" ? getSystemPref() : (mode as "dark" | "light");
      setResolved(r);
    };
    apply();
    if (mode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: light)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [mode]);

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.classList.toggle("light", resolved === "light");
  }, [resolved]);

  // Apply accent CSS vars
  useEffect(() => {
    const def = ACCENTS.find((a) => a.id === accent) || ACCENTS[0];
    const root = document.documentElement;
    root.style.setProperty("--primary", def.primary);
    root.style.setProperty("--primary-glow", def.primaryGlow);
    root.style.setProperty("--ring", def.ring);
    root.style.setProperty("--glow-primary", def.primary);
    root.style.setProperty("--sidebar-primary", def.primary);
    root.style.setProperty("--sidebar-ring", def.ring);
    // Update gradient-primary too
    root.style.setProperty(
      "--gradient-primary",
      `linear-gradient(135deg, hsl(${def.primary}), hsl(${def.primaryGlow}))`
    );
  }, [accent]);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_MODE, m);
  };
  const setAccent = (a: AccentColor) => {
    setAccentState(a);
    localStorage.setItem(STORAGE_ACCENT, a);
  };

  return (
    <ThemeContext.Provider value={{ mode, resolved, accent, setMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
