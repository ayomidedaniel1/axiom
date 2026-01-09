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
import { useResearch } from "@/hooks/use-research";
import { useChatHistory, Message } from "@/hooks/use-chat-history";
import { useAuth } from "@/components/auth/auth-provider";
import { UIMessage } from "ai";

export default function Page() {
  const { user, loading: authLoading } = useAuth();
  const { messages, sendMessage, setMessages, steps, isLoading, errorInfo } = useResearch();
  const {
    conversations,
    currentConversationId,
    loading: historyLoading,
    loadConversations,
    loadMessages,
    createConversation,
    updateConversationTitle,
    saveMessage,
    deleteConversation,
    selectConversation,
  } = useChatHistory();

  const [input, setInput] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [historyVisible, setHistoryVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSavedMessageRef = useRef<string | null>(null);

  const getTextFromMessage = (message: UIMessage) => {
    if (!message.parts) return "";
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");
  };

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId).then((dbMessages) => {
        // Convert DB messages to UIMessage format
        const uiMessages: UIMessage[] = dbMessages.map((m: Message) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          parts: [{ type: "text" as const, text: m.content }],
          createdAt: new Date(m.created_at),
        }));
        setMessages(uiMessages);
      });
    } else {
      setMessages([]);
    }
  }, [currentConversationId, loadMessages, setMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, steps, isLoading]);

  // Save assistant messages when they complete
  useEffect(() => {
    if (!currentConversationId || isLoading) return;

    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.role === "assistant" &&
      lastMessage.id !== lastSavedMessageRef.current
    ) {
      const content = getTextFromMessage(lastMessage);
      if (content) {
        saveMessage(currentConversationId, "assistant", content);
        lastSavedMessageRef.current = lastMessage.id;

        // Update conversation title based on first user message if it's still "New Chat"
        const conv = conversations.find((c) => c.id === currentConversationId);
        if (conv && conv.title === "New Chat" && messages.length >= 2) {
          const firstUserMessage = messages.find((m) => m.role === "user");
          if (firstUserMessage) {
            const title = getTextFromMessage(firstUserMessage).slice(0, 50);
            updateConversationTitle(currentConversationId, title || "New Chat");
          }
        }
      }
    }
  }, [messages, isLoading, currentConversationId, saveMessage, conversations, updateConversationTitle]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");

    // Create new conversation if none selected
    let convId = currentConversationId;
    if (!convId) {
      convId = await createConversation();
      if (!convId) return;
    }

    // Save user message
    await saveMessage(convId, "user", text);

    // Send to AI
    await sendMessage({ text });
  };

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
  };

  const handleNewChat = useCallback(async () => {
    selectConversation(null);
    setMessages([]);
    lastSavedMessageRef.current = null;
  }, [selectConversation, setMessages]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      selectConversation(id);
      lastSavedMessageRef.current = null;
    },
    [selectConversation]
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
        onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        sidebarVisible={sidebarVisible}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Chat History Sidebar */}
        <div
          className={`
            h-full glass flex flex-col border-r border-white/5 transition-all duration-300 overflow-hidden
            ${historyVisible ? 'w-64' : 'w-0'}
          `}
        >
          <ChatHistory
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            onDeleteConversation={deleteConversation}
            loading={historyLoading}
          />
        </div>

        {/* Toggle History Button (when hidden) */}
        {!historyVisible && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setHistoryVisible(true)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-lg bg-secondary/80 hover:bg-white/10"
          >
            <History className="w-4 h-4 text-muted-foreground" />
          </Button>
        )}

        {/* CENTER: Chat Interface */}
        <div className={`flex flex-col h-full relative transition-all duration-300 flex-1`}>
          {/* History Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setHistoryVisible(!historyVisible)}
            className="absolute left-4 top-4 z-10 h-8 w-8 rounded-lg hover:bg-white/5"
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

        {/* RIGHT: Live Thought Logs */}
        <div
          className={`
            h-full glass flex flex-col border-l border-white/5 transition-all duration-300 overflow-hidden
            ${sidebarVisible ? 'w-80 lg:w-96 opacity-100' : 'w-0 opacity-0'}
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

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden p-4">
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
        </div>
      </div>
    </div>
  );
}