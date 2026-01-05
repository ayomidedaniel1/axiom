"use client";

import { Search, TrendingUp, Globe, Lightbulb } from "lucide-react";

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

const suggestions = [
  {
    icon: TrendingUp,
    label: "Latest AI trends",
    prompt: "What are the latest trends in AI and machine learning in 2025?",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
  },
  {
    icon: Search,
    label: "Research a topic",
    prompt: "Give me a comprehensive overview of quantum computing advances",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
  },
  {
    icon: Globe,
    label: "Current events",
    prompt: "What are the most significant global events happening this week?",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20",
  },
  {
    icon: Lightbulb,
    label: "Explore ideas",
    prompt: "Explain the future of renewable energy and sustainable technology",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 hover:bg-amber-500/20",
  },
];

export function PromptSuggestions({ onSelectPrompt }: PromptSuggestionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.icon;
        return (
          <button
            key={suggestion.label}
            onClick={() => onSelectPrompt(suggestion.prompt)}
            className={`
              animate-stagger group flex items-center gap-3 p-4 rounded-xl border border-white/5
              ${suggestion.bgColor} transition-all duration-200
              hover:border-white/10 hover:scale-[1.02] active:scale-[0.98]
            `}
            style={{ "--stagger-index": index } as React.CSSProperties}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-black/20 ${suggestion.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium text-foreground/90">{suggestion.label}</span>
              <span className="text-xs text-muted-foreground line-clamp-1">{suggestion.prompt}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
