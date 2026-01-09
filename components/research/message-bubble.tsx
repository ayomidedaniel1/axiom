"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Bot, User, Copy, Check, Download } from "lucide-react";
import { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { CitationLink } from "./citation-link";
import { ExportDialog } from "./export-dialog";
import { useCitationsStore } from "@/stores/citations-store";

interface MessageBubbleProps {
  message: UIMessage;
  getTextFromMessage: (message: UIMessage) => string;
  createdAt?: Date | string;
  query?: string;
}

export function MessageBubble({ message, getTextFromMessage, createdAt, query }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const content = getTextFromMessage(message);
  const parseCitationsFromText = useCitationsStore((state) => state.parseCitationsFromText);

  // Parse citations from assistant messages
  useEffect(() => {
    if (message.role === "assistant" && content) {
      parseCitationsFromText(content);
    }
  }, [content, message.role, parseCitationsFromText]);

  // Memoize the citation pattern regex
  const citationPattern = useMemo(() => /\[(\d+)\]/g, []);

  // Render text with citation links
  const renderTextWithCitations = useCallback((text: string) => {
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    // Reset regex
    citationPattern.lastIndex = 0;

    while ((match = citationPattern.exec(text)) !== null) {
      // Add text before the citation
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      // Add citation link
      const citationIndex = parseInt(match[1], 10);
      parts.push(
        <CitationLink key={`citation-${match.index}`} index={citationIndex} />
      );
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  }, [citationPattern]);

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

  // Custom components for ReactMarkdown to handle citations
  const markdownComponents = {
    p: ({ children, ...props }: React.ComponentProps<'p'>) => {
      // Process children to add citation links
      const processedChildren = typeof children === 'string'
        ? renderTextWithCitations(children)
        : children;
      return <p {...props}>{processedChildren}</p>;
    },
    li: ({ children, ...props }: React.ComponentProps<'li'>) => {
      const processedChildren = typeof children === 'string'
        ? renderTextWithCitations(children)
        : children;
      return <li {...props}>{processedChildren}</li>;
    },
  };

  return (
    <>
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
                <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
              </div>
            )}

            {/* Action Buttons (for assistant messages) */}
            {!isUser && (
              <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={() => setShowExport(true)}
                  className="p-1.5 rounded-lg bg-secondary border border-white/10 hover:bg-secondary/80"
                  title="Export report"
                >
                  <Download className="w-3 h-3 text-muted-foreground" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-secondary border border-white/10 hover:bg-secondary/80"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
              </div>
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

      {/* Export Dialog */}
      <ExportDialog
        content={content}
        query={query}
        isOpen={showExport}
        onClose={() => setShowExport(false)}
      />
    </>
  );
}
