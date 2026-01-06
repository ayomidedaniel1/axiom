"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, Search, BookOpen, ChevronDown, ChevronRight, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResearchStep {
  id: string;
  type: 'tool';
  toolName: string;
  input: unknown;
  isComplete: boolean;
  result?: unknown;
}

export interface ReasoningStep {
  id: string;
  type: 'reasoning';
  content: string;
  isComplete: boolean;
}

export type ThoughtStep = ResearchStep | ReasoningStep;

interface ThoughtLogProps {
  steps: ThoughtStep[];
}

function StepCard({ step, index, isLast }: { step: ResearchStep; index: number; isLast: boolean; }) {
  const [expanded, setExpanded] = useState(false);

  const getToolIcon = () => {
    switch (step.toolName) {
      case 'webSearch':
        return <Search className="w-3.5 h-3.5" />;
      case 'readPage':
        return <BookOpen className="w-3.5 h-3.5" />;
      default:
        return <Search className="w-3.5 h-3.5" />;
    }
  };

  const getToolColor = () => {
    switch (step.toolName) {
      case 'webSearch':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'readPage':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    }
  };

  const formatInput = (input: unknown): string => {
    if (typeof input === 'string') return input;
    if (typeof input === 'object' && input !== null) {
      // Try to extract meaningful info
      const obj = input as Record<string, unknown>;
      if (obj.query) return String(obj.query);
      if (obj.url) return String(obj.url);
      return JSON.stringify(input, null, 2);
    }
    return String(input);
  };

  const displayInput = formatInput(step.input);
  const isLongInput = displayInput.length > 60;

  return (
    <div
      className={cn(
        "relative animate-fade-in",
        !isLast && "timeline-connector"
      )}
      style={{ "--stagger-index": index } as React.CSSProperties}
    >
      {/* Timeline Node */}
      <div className="flex items-start gap-3">
        {/* Node Circle */}
        <div className={cn(
          "relative z-10 flex items-center justify-center w-6 h-6 rounded-full border",
          getToolColor(),
          !step.isComplete && "animate-pulse"
        )}>
          {getToolIcon()}
        </div>

        {/* Content Card */}
        <div
          className={cn(
            "flex-1 group rounded-xl border transition-all duration-200 cursor-pointer",
            "hover:bg-white/5",
            step.isComplete
              ? "bg-transparent border-white/5"
              : "bg-white/5 border-white/10 shadow-lg shadow-primary/5"
          )}
          onClick={() => setExpanded(!expanded)}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-foreground/90 capitalize">
                {step.toolName === 'webSearch' ? 'Web Search' :
                  step.toolName === 'readPage' ? 'Read Page' :
                    step.toolName}
              </span>
              {!step.isComplete && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                  Running
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {step.isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400/70" />
              ) : (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              )}
              {isLongInput && (
                expanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                )
              )}
            </div>
          </div>

          {/* Input Preview / Expanded Content */}
          <div className="px-3 pb-3">
            <div className={cn(
              "font-mono text-[11px] text-muted-foreground/70 rounded-lg p-2 bg-black/20",
              !expanded && "truncate"
            )}>
              <span className="text-primary/50 mr-1.5">$</span>
              {expanded ? (
                <pre className="whitespace-pre-wrap wrap-break-word">{displayInput}</pre>
              ) : (
                <span className="truncate">{displayInput.slice(0, 60)}{isLongInput && '...'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReasoningCard({ step, index, isLast }: { step: ReasoningStep; index: number; isLast: boolean; }) {
  const [expanded, setExpanded] = useState(false);
  const isLongContent = step.content.length > 100;

  return (
    <div
      className={cn(
        "relative animate-fade-in",
        !isLast && "timeline-connector"
      )}
      style={{ "--stagger-index": index } as React.CSSProperties}
    >
      <div className="flex items-start gap-3">
        {/* Node Circle - Brain icon for reasoning */}
        <div className={cn(
          "relative z-10 flex items-center justify-center w-6 h-6 rounded-full border",
          "text-violet-400 bg-violet-500/10 border-violet-500/20",
          !step.isComplete && "animate-pulse"
        )}>
          <Brain className="w-3.5 h-3.5" />
        </div>

        {/* Content Card */}
        <div
          className={cn(
            "flex-1 group rounded-xl border transition-all duration-200 cursor-pointer",
            "hover:bg-white/5",
            step.isComplete
              ? "bg-transparent border-white/5"
              : "bg-violet-500/5 border-violet-500/10 shadow-lg shadow-violet-500/5"
          )}
          onClick={() => setExpanded(!expanded)}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-foreground/90">
                Thinking
              </span>
              {!step.isComplete && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-medium">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {step.isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400/70" />
              ) : (
                <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
              )}
              {isLongContent && (
                expanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                )
              )}
            </div>
          </div>

          {/* Reasoning Content */}
          <div className="px-3 pb-3">
            <div className={cn(
              "text-[11px] text-muted-foreground/80 rounded-lg p-2 bg-black/20 leading-relaxed",
              !expanded && "line-clamp-3"
            )}>
              {expanded ? (
                <p className="whitespace-pre-wrap">{step.content}</p>
              ) : (
                <p>{step.content.slice(0, 150)}{isLongContent && '...'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThoughtLog({ steps }: ThoughtLogProps) {
  return (
    <ScrollArea className="h-full pr-2">
      <div className="flex flex-col gap-4 pb-4">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          if (step.type === 'reasoning') {
            return (
              <ReasoningCard
                key={step.id}
                step={step}
                index={index}
                isLast={isLast}
              />
            );
          }

          return (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              isLast={isLast}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
}