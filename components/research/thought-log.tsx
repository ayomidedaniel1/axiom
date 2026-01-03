import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Search, BookOpen } from "lucide-react";

// Define the shape of our log data to satisfy TypeScript
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
      <div className="flex flex-col gap-4">
        {steps.map((step) => (
          <div key={step.toolCallId} className="flex flex-col gap-2 p-3 border rounded-lg bg-card shadow-sm text-sm">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {step.toolName === 'webSearch' ? <Search className="w-4 h-4 text-blue-500" /> : <BookOpen className="w-4 h-4 text-green-500" />}
                <span className="font-semibold capitalize">{step.toolName}</span>
              </div>
              <div>
                {step.state === 'result' ? (
                  <Badge variant="secondary" className="text-green-700 bg-green-50"><CheckCircle2 className="w-3 h-3 mr-1" /> Done</Badge>
                ) : (
                  <Badge variant="outline"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Working</Badge>
                )}
              </div>
            </div>

            {/* Input Visualization */}
            <div className="bg-slate-50 p-2 rounded border font-mono text-xs text-slate-600">
              {JSON.stringify(step.args)}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}