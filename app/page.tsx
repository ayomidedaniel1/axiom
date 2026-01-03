"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ThoughtLog } from "@/components/research/thought-log";
import { MOCK_MESSAGES, MOCK_STEPS } from "@/lib/mock-data";

export default function Page() {
  const [input, setInput] = useState("");

  return (
    <div className="grid grid-cols-12 h-screen w-full bg-slate-50">

      {/* LEFT: Chat & Report Area */}
      <div className="col-span-8 flex flex-col h-full border-r bg-white">
        <div className="flex-1 p-8 overflow-y-auto">
          {MOCK_MESSAGES.map((m, i) => (
            <div key={i} className={`mb-6 ${m.role === 'assistant' ? 'prose prose-slate' : 'bg-slate-100 p-4 rounded-lg inline-block'}`}>
              {m.content}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t bg-white">
          <form className="flex gap-4">
            <Input
              placeholder="Research a topic..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button>
              <Send className="w-4 h-4 mr-2" /> Research
            </Button>
          </form>
        </div>
      </div>

      {/* RIGHT: Agent Thought Process */}
      <div className="col-span-4 flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b bg-white/50 backdrop-blur">
          <h2 className="font-semibold text-sm text-slate-900">Agent Activity</h2>
        </div>
        <div className="p-4 flex-1 overflow-hidden">
          <ThoughtLog steps={MOCK_STEPS} />
        </div>
      </div>
    </div>
  );
}