import { create } from "zustand";

export type ThemeMode = "light" | "dark";

interface AppState {
  theme: ThemeMode;
  search: string;
  setSearch: (v: string) => void;
  toggleTheme: () => void;
  setTheme: (m: ThemeMode) => void;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("uf-theme") as ThemeMode | null;
  if (saved) return saved;
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
};

export const useAppStore = create<AppState>((set, get) => ({
  theme: getInitialTheme(),
  search: "",
  setSearch: (v) => set({ search: v }),
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    set({ theme: next });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next === "dark");
    }
    localStorage.setItem("uf-theme", next);
  },
  setTheme: (m) => {
    set({ theme: m });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", m === "dark");
    }
    localStorage.setItem("uf-theme", m);
  },
}));

// initialize html class
if (typeof document !== "undefined") {
  const initial = getInitialTheme();
  document.documentElement.classList.toggle("dark", initial === "dark");
}
