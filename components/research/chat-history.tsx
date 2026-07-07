"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Plus, Trash2, Sparkles, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/hooks/use-conversations";

interface ChatHistoryProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onUpdateConversationTitle?: (id: string, title: string) => void;
  isLoading?: boolean;
}

export function ChatHistory({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onUpdateConversationTitle,
  isLoading,
}: ChatHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleSave = (id: string) => {
    if (editTitle.trim() && onUpdateConversationTitle) {
      onUpdateConversationTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-white/5">
        <Button
          onClick={onNewChat}
          className="w-full h-10 gradient-purple hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/50 gap-2">
              <Sparkles className="w-8 h-8" />
              <p className="text-xs">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`
                  flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all w-full group/item
                  ${currentConversationId === conv.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-white/5"
                  }
                `}
                onClick={() => {
                  if (editingId !== conv.id) {
                    onSelectConversation(conv.id);
                  }
                }}
              >
                <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 w-0">
                  {editingId === conv.id ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSave(conv.id);
                        } else if (e.key === "Escape") {
                          setEditingId(null);
                        }
                      }}
                      onBlur={() => handleSave(conv.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-secondary/80 border border-white/10 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-primary/50 text-foreground"
                    />
                  ) : (
                    <>
                      <p className="text-sm truncate">{conv.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{formatDate(conv.updated_at)}</p>
                    </>
                  )}
                </div>
                {editingId !== conv.id && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                    {onUpdateConversationTitle && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(conv.id);
                          setEditTitle(conv.title);
                        }}
                      >
                        <PenLine className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
