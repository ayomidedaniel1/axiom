"use client";

import { Sparkles, Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarVisible?: boolean;
}

export function Header({ onToggleSidebar, sidebarVisible = true }: HeaderProps) {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("axiom-theme") as "dark" | "light" | null;
      return savedTheme ?? "dark";
    }
    return "dark";
  });

  // Sync the theme class with the document (external system sync - no setState)
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("axiom-theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 glass">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg gradient-purple animate-pulse-glow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight">Axiom</span>
            <span className="text-[10px] text-muted-foreground -mt-0.5">Research Agent</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 rounded-lg hover:bg-white/5 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>

          {/* Sidebar Toggle (visible on smaller screens or always) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-8 w-8 rounded-lg hover:bg-white/5 transition-colors md:flex"
          >
            <Menu className={`w-4 h-4 text-muted-foreground transition-transform ${sidebarVisible ? '' : 'rotate-180'}`} />
          </Button>
        </div>
      </div>
    </header>
  );
}
