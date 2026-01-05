"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";
import { ThoughtLog } from "@/components/research/thought-log";
import { useResearch } from "@/hooks/use-research";
import ReactMarkdown from "react-markdown";
import { UIMessage } from "ai";

export default function Page() {
  const { messages, sendMessage, steps } = useResearch();
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const messageText = input;

    setInput("");

    await sendMessage({
      text: messageText,
    });
  };

  // Helper: Extract text content safely from UIMessage parts
  const getTextFromMessage = (message: UIMessage) => {
    if (!message.parts) return "";
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");
  };

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  const reportContent = lastAssistantMessage ? getTextFromMessage(lastAssistantMessage) : "";

  return (
    <div className="grid grid-cols-12 h-screen w-full overflow-hidden bg-background text-foreground">

      {/* LEFT: Chat Area */}
      <div className="col-span-8 flex flex-col h-full relative">
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <div className="max-w-3xl mx-auto space-y-8">

            {/* User Message */}
            {messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <div className="flex justify-end">
                <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
                  {getTextFromMessage(messages[messages.length - 1])}
                </div>
              </div>
            )}

            {/* Assistant Report */}
            {lastAssistantMessage && reportContent ? (
              <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-secondary/50 max-w-none animate-in fade-in duration-500">
                <ReactMarkdown>{reportContent}</ReactMarkdown>
              </div>
            ) : (
              // Empty State
              messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full pt-20 opacity-50">
                  <Sparkles className="w-12 h-12 mb-4 text-muted-foreground" />
                  <p className="text-xl font-medium">Ready to research.</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6">
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-pink-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative flex gap-2 bg-secondary/80 backdrop-blur-xl p-2 rounded-xl border border-white/5"
            >
              <Input
                placeholder="Ask Axiom to research anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent border-none focus-visible:ring-0 text-base h-12"
              />
              <Button type="submit" size="icon" className="h-12 w-12 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* RIGHT: Agent Sidebar */}
      <div className="col-span-4 h-full border-l border-white/5 bg-secondary/10 backdrop-blur-sm flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h2 className="font-medium text-sm tracking-wide text-muted-foreground uppercase">Research Loops</h2>
        </div>
        <div className="p-6 flex-1 overflow-hidden">
          <ThoughtLog steps={steps} />
        </div>
      </div>
    </div>
  );
}