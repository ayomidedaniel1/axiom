"use client";

import { useState } from "react";
import { Bot, User, Copy, Check } from "lucide-react";
import { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: UIMessage;
  getTextFromMessage: (message: UIMessage) => string;
  createdAt?: Date | string;
}

export function MessageBubble({ message, getTextFromMessage, createdAt }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const content = getTextFromMessage(message);

  if (!content) return null;

  const isUser = message.role === "user";
  const timestamp = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group flex gap-3 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Message Content */}
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div
          className={`
            relative px-4 py-3 rounded-2xl
            ${isUser
              ? 'gradient-purple text-white rounded-tr-sm shadow-lg shadow-purple-500/20'
              : 'bg-secondary/50 border border-white/5 rounded-tl-sm'
            }
          `}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap text-sm">{content}</div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-custom">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}

          {/* Copy Button (for assistant messages) */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-secondary border border-white/10 hover:bg-secondary/80"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className={`text-[10px] text-muted-foreground/50 ${isUser ? 'text-right' : 'text-left'} px-1`}>
            {timestamp}
          </span>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
          <User className="w-4 h-4 text-foreground/70" />
        </div>
      )}
    </div>
  );
}
