import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, Search, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResearchStep {
  id: string;
  toolName: string;
  input: unknown;
  isComplete: boolean;
  result?: unknown;
}

interface ThoughtLogProps {
  steps: ResearchStep[];
}

export function ThoughtLog({ steps }: ThoughtLogProps) {
  return (
    <ScrollArea className="h-full pr-4">
      <div className="flex flex-col gap-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "group flex flex-col gap-2 p-3 rounded-lg border border-transparent transition-all",
              "hover:bg-white/5 hover:border-white/10",
              !step.isComplete && "bg-white/5 border-white/5"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full bg-secondary/50",
                  step.toolName === 'webSearch' ? "text-blue-400" : "text-emerald-400"
                )}>
                  {step.toolName === 'webSearch' ? <Search size={12} /> : <BookOpen size={12} />}
                </div>
                <span className="font-medium text-sm text-foreground/90 capitalize tracking-tight">
                  {step.toolName}
                </span>
              </div>
              <div>
                {step.isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground/50" />
                ) : (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                )}
              </div>
            </div>

            {/* Input Data */}
            <div className="pl-9">
              <div className="font-mono text-[10px] text-muted-foreground/70 truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                <span className="text-primary/40 mr-2">$</span>
                {JSON.stringify(step.input)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}