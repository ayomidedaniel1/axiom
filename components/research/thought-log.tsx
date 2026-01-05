import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, Search, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogStep {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

export function ThoughtLog({ steps }: { steps: LogStep[]; }) {
  return (
    <ScrollArea className="h-full pr-4">
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => {
          const isDone = step.state === 'result';

          return (
            <div
              key={step.toolCallId}
              className={cn(
                "group flex flex-col gap-2 p-3 rounded-lg border border-transparent transition-all",
                // Hover effect: slight glow and border reveal
                "hover:bg-white/5 hover:border-white/10",
                // Active state: subtle pulse background
                !isDone && "bg-white/5 border-white/5"
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
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground/50" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  )}
                </div>
              </div>

              {/* Input (Terminal Style) */}
              <div className="pl-9">
                <div className="font-mono text-[10px] text-muted-foreground/70 truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                  <span className="text-primary/40 mr-2">$</span>
                  {JSON.stringify(step.args)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State / Vertical Line Connector Placeholder */}
        {steps.length > 0 && (
          <div className="absolute left-[27px] top-4 bottom-4 w-px bg-border -z-10" />
        )}
      </div>
    </ScrollArea>
  );
}