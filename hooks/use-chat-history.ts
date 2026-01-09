"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useChatHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const loadMessages = useCallback(
    async (conversationId: string): Promise<Message[]> => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error loading messages:", error);
        return [];
      }
    },
    [supabase]
  );

  const createConversation = useCallback(
    async (title?: string): Promise<string | null> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return null;

        const { data, error } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            title: title || "New Chat",
          })
          .select()
          .single();

        if (error) throw error;

        setConversations((prev) => [data, ...prev]);
        setCurrentConversationId(data.id);
        return data.id;
      } catch (error) {
        console.error("Error creating conversation:", error);
        return null;
      }
    },
    [supabase]
  );

  const updateConversationTitle = useCallback(
    async (conversationId: string, title: string) => {
      try {
        const { error } = await supabase
          .from("conversations")
          .update({ title, updated_at: new Date().toISOString() })
          .eq("id", conversationId);

        if (error) throw error;

        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, title, updated_at: new Date().toISOString() } : c
          )
        );
      } catch (error) {
        console.error("Error updating conversation title:", error);
      }
    },
    [supabase]
  );

  const saveMessage = useCallback(
    async (conversationId: string, role: "user" | "assistant", content: string, metadata?: Record<string, unknown>) => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            role,
            content,
            metadata: metadata || {},
          })
          .select()
          .single();

        if (error) throw error;

        // Update conversation's updated_at
        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId);

        return data;
      } catch (error) {
        console.error("Error saving message:", error);
        return null;
      }
    },
    [supabase]
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        const { error } = await supabase
          .from("conversations")
          .delete()
          .eq("id", conversationId);

        if (error) throw error;

        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        if (currentConversationId === conversationId) {
          setCurrentConversationId(null);
        }
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    },
    [supabase, currentConversationId]
  );

  const selectConversation = useCallback((conversationId: string | null) => {
    setCurrentConversationId(conversationId);
  }, []);

  return {
    conversations,
    currentConversationId,
    loading,
    loadConversations,
    loadMessages,
    createConversation,
    updateConversationTitle,
    saveMessage,
    deleteConversation,
    selectConversation,
  };
}
