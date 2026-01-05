"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react"; // Added Sparkles for premium feel
import { ThoughtLog } from "@/components/research/thought-log";
import { MOCK_MESSAGES, MOCK_STEPS } from "@/lib/mock-data";

export default function Page() {
  const [input, setInput] = useState("");

  return (
    <div className="grid grid-cols-12 h-screen w-full overflow-hidden bg-background text-foreground">

      {/* LEFT: Chat Area (Clean, Readable) */}
      <div className="col-span-8 flex flex-col h-full relative">
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <div className="max-w-3xl mx-auto space-y-8">
            {MOCK_MESSAGES.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
                <div className={m.role === 'user'
                  ? 'bg-secondary text-secondary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%]'
                  : 'prose prose-invert prose-p:leading-relaxed prose-pre:bg-secondary/50 max-w-none'}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area (Floating) */}
        <div className="p-6">
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <form className="relative flex gap-2 bg-secondary/80 backdrop-blur-xl p-2 rounded-xl border border-white/5">
              <Input
                placeholder="Ask Axiom to research anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent border-none focus-visible:ring-0 text-base h-12"
              />
              <Button size="icon" className="h-12 w-12 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* RIGHT: Agent Sidebar (Glassmorphism) */}
      <div className="col-span-4 h-full border-l border-white/5 bg-secondary/10 backdrop-blur-sm flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h2 className="font-medium text-sm tracking-wide text-muted-foreground uppercase">Research Loops</h2>
        </div>
        <div className="p-6 flex-1 overflow-hidden">
          <ThoughtLog steps={MOCK_STEPS} />
        </div>
      </div>
    </div>
  );
}