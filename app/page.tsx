"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, Bot, PanelRightClose, PanelRight, Command, AlertCircle, History } from "lucide-react";
import { ThoughtLog } from "@/components/research/thought-log";
import { Header } from "@/components/layout/header";
import { PromptSuggestions } from "@/components/research/prompt-suggestions";
import { MessageBubble } from "@/components/research/message-bubble";
import { ChatHistory } from "@/components/research/chat-history";
import { SourcesPanel } from "@/components/research/sources-panel";
import { useResearch } from "@/hooks/use-research";
import { useAuth } from "@/components/auth/auth-provider";
import { useUIStore } from "@/stores/ui-store";
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  useUpdateConversationTitle,
} from "@/hooks/use-conversations";
import { useMessages, useSaveMessage, Message } from "@/hooks/use-messages";
import { UIMessage } from "ai";

export default function Page() {
  const { user, loading: authLoading } = useAuth();
  const { messages, sendMessage, setMessages, steps, isLoading, errorInfo } = useResearch();

  // Zustand UI state
  const {
    currentConversationId,
    setCurrentConversation,
    sidebarVisible,
    historyVisible,
    toggleSidebar,
    toggleHistory,
    setHistoryVisible,
    setSidebarVisible,
    isMobile,
    setIsMobile,
    hasHydrated,
  } = useUIStore();

  // React Query hooks
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: dbMessages = [] } = useMessages(currentConversationId);
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const updateTitle = useUpdateConversationTitle();
  const saveMessage = useSaveMessage();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSavedMessageRef = useRef<string | null>(null);
  // Track if we're restoring from DB (to prevent save loops)
  const isRestoringFromDbRef = useRef(false);
  // Track which message IDs came from the database
  const dbMessageIdsRef = useRef<Set<string>>(new Set());

  const getTextFromMessage = (message: UIMessage) => {
    if (!message.parts) return "";
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");
  };

  // Sync DB messages to UI messages when conversation changes
  const prevConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only sync when we have DB messages AND conversation changed
    if (dbMessages.length > 0 && currentConversationId !== prevConversationIdRef.current) {
      // Mark that we're restoring from DB
      isRestoringFromDbRef.current = true;

      // Store DB message IDs so we know not to re-save them
      dbMessageIdsRef.current = new Set(dbMessages.map(m => m.id));

      const uiMessages: UIMessage[] = dbMessages.map((m: Message) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        parts: [{ type: "text" as const, text: m.content }],
        createdAt: new Date(m.created_at),
      }));
      setMessages(uiMessages);

      // Reset flag after a tick to allow normal operation
      setTimeout(() => {
        isRestoringFromDbRef.current = false;
      }, 100);
    }
    // Clear messages when switching to new conversation (null)
    else if (currentConversationId === null && prevConversationIdRef.current !== null) {
      setMessages([]);
      dbMessageIdsRef.current = new Set();
    }

    prevConversationIdRef.current = currentConversationId;
  }, [dbMessages, currentConversationId, setMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, steps, isLoading]);

  // Mobile detection and initial sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      return mobile;
    };

    // Initial check and close sidebars on mobile
    const mobile = checkMobile();
    if (mobile) {
      setSidebarVisible(false);
      setHistoryVisible(false);
    }

    // Listen for resize
    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile, setSidebarVisible, setHistoryVisible]);

  // Save assistant messages when they complete
  useEffect(() => {
    // Skip if restoring from DB, no conversation, or still loading
    if (isRestoringFromDbRef.current || !currentConversationId || isLoading) return;

    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.role === "assistant" &&
      lastMessage.id !== lastSavedMessageRef.current
    ) {
      // Skip if this message ID came from the database
      if (dbMessageIdsRef.current.has(lastMessage.id)) {
        lastSavedMessageRef.current = lastMessage.id;
        return;
      }

      const content = getTextFromMessage(lastMessage);
      if (content) {
        saveMessage.mutate({
          conversationId: currentConversationId,
          role: "assistant",
          content,
        });
        lastSavedMessageRef.current = lastMessage.id;

        // Update conversation title based on first user message if it's still "New Chat"
        const conv = conversations.find((c) => c.id === currentConversationId);
        if (conv && conv.title === "New Chat" && messages.length >= 2) {
          const firstUserMessage = messages.find((m) => m.role === "user");
          if (firstUserMessage) {
            const title = getTextFromMessage(firstUserMessage).slice(0, 30);
            updateTitle.mutate({ id: currentConversationId, title: title || "New Chat" });
          }
        }
      }
    }
  }, [messages, isLoading, currentConversationId, saveMessage, conversations, updateTitle]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");

    // Create new conversation if none selected
    let convId = currentConversationId;
    if (!convId) {
      const newConv = await createConversation.mutateAsync(undefined);
      convId = newConv.id;
      setCurrentConversation(convId);
    }

    // Save user message
    await saveMessage.mutateAsync({
      conversationId: convId,
      role: "user",
      content: text,
    });

    // Send to AI
    await sendMessage({ text });
  };

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
  };

  const handleNewChat = useCallback(() => {
    setCurrentConversation(null);
    setMessages([]);
    lastSavedMessageRef.current = null;
  }, [setCurrentConversation, setMessages]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      setCurrentConversation(id);
      lastSavedMessageRef.current = null;
    },
    [setCurrentConversation]
  );

  const handleDeleteConversation = useCallback(
    (id: string) => {
      deleteConversation.mutate(id);
      if (currentConversationId === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    },
    [deleteConversation, currentConversationId, setCurrentConversation, setMessages]
  );

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="w-5 h-5 border-2 border-white/30 border-t-primary rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Header */}
      <Header
        onToggleSidebar={toggleSidebar}
        sidebarVisible={sidebarVisible}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Chat History Sidebar */}
        <div
          className={`
            glass flex flex-col border-r border-white/5 transition-all duration-300 overflow-hidden
            ${isMobile
              ? `fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] ${historyVisible ? 'w-64 opacity-100' : 'w-0 opacity-0'}`
              : `h-full ${historyVisible ? 'w-64' : 'w-0'}`
            }
          `}
        >
          <ChatHistory
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            onDeleteConversation={handleDeleteConversation}
            isLoading={conversationsLoading}
          />
        </div>

        {/* Mobile backdrop overlay */}
        {isMobile && (historyVisible || sidebarVisible) && (
          <div
            className="fixed inset-0 top-14 bg-black/50 z-30 backdrop-blur-sm"
            onClick={() => {
              if (historyVisible) setHistoryVisible(false);
              if (sidebarVisible) setSidebarVisible(false);
            }}
          />
        )}

        {/* Toggle History Button (when hidden) */}
        {!historyVisible && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setHistoryVisible(true)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-50 h-8 w-8 rounded-lg bg-secondary/80 hover:bg-white/10"
          >
            <History className="w-4 h-4 text-muted-foreground" />
          </Button>
        )}

        {/* CENTER: Chat Interface */}
        <div className="flex flex-col h-full relative transition-all duration-300 flex-1">
          {/* History Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleHistory}
            className="absolute left-4 top-4 z-50 h-8 w-8 rounded-lg hover:bg-white/5"
          >
            {historyVisible ? (
              <PanelRightClose className="w-4 h-4 text-muted-foreground rotate-180" />
            ) : (
              <PanelRight className="w-4 h-4 text-muted-foreground rotate-180" />
            )}
          </Button>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <div className="max-w-3xl mx-auto space-y-6">

              {/* Empty State */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 blur-3xl bg-purple-500/20 rounded-full" />
                    <div className="relative w-20 h-20 rounded-2xl gradient-purple flex items-center justify-center shadow-2xl shadow-purple-500/30">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-semibold gradient-text">Axiom Research Agent</h1>
                    <p className="text-muted-foreground">
                      Search the web, analyze sources, and get research reports.
                    </p>
                  </div>
                  <PromptSuggestions onSelectPrompt={handlePromptSelect} />
                </div>
              )}

              {/* Messages */}
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  getTextFromMessage={getTextFromMessage}
                />
              ))}

              {/* Error Display */}
              {errorInfo && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%]">
                    <p className="text-red-400 font-medium text-sm">{errorInfo.title}</p>
                    <p className="text-red-300/70 text-xs mt-1">{errorInfo.message}</p>
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-secondary/50 border border-white/5 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">Researching...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 glass border-t border-white/5">
            <div className="max-w-3xl mx-auto">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative flex gap-2"
              >
                <div className="relative flex-1">
                  <Input
                    placeholder="Ask a research question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full bg-secondary/50 border-white/10 focus-visible:ring-1 focus-visible:ring-primary/50 h-12 pl-4 pr-12 rounded-xl text-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-muted-foreground/40">
                    <Command className="w-3 h-3" />
                    <span className="text-[10px]">Enter</span>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="h-12 w-12 rounded-xl gradient-purple hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
                >
                  <Send className="w-5 h-5 text-white" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Thought Logs & Sources */}
        <div
          className={`
            glass flex flex-col border-l border-white/5 transition-all duration-300 overflow-hidden
            ${isMobile
              ? `fixed top-14 right-0 z-40 h-[calc(100vh-3.5rem)] ${sidebarVisible ? 'w-80 opacity-100' : 'w-0 opacity-0'}`
              : `h-full ${sidebarVisible ? 'w-80 lg:w-96 opacity-100' : 'w-0 opacity-0'}`
            }
          `}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md gradient-purple flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-xs tracking-wide text-foreground/80">Live Reasoning</span>
            </div>
            {steps.length > 0 && (
              <span className="text-[10px] bg-white/5 px-2 py-1 rounded-full text-muted-foreground font-mono">
                {steps.length} {steps.length === 1 ? 'Step' : 'Steps'}
              </span>
            )}
          </div>

          {/* Thought Log Content */}
          <div className="flex-1 overflow-hidden p-4 min-h-0">
            {steps.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 gap-3">
                <div className="w-16 h-16 border-2 border-dashed border-current rounded-2xl opacity-30 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">Waiting for research</p>
                  <p className="text-[10px] mt-0.5">Agent steps will appear here</p>
                </div>
              </div>
            ) : (
              <ThoughtLog steps={steps} />
            )}
          </div>

          {/* Sources Panel - below ThoughtLog */}
          <div className="border-t border-white/5 max-h-[40%] overflow-hidden">
            <SourcesPanel />
          </div>
        </div>
      </div>
    </div>
  );
}