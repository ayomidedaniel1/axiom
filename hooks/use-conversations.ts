'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

// Types
export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// Query keys for cache management
export const conversationKeys = {
  all: ['conversations'] as const,
  detail: (id: string) => ['conversations', id] as const,
};

// Fetch all conversations
export function useConversations() {
  const supabase = createClient();

  return useQuery({
    queryKey: conversationKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    },
  });
}

// Create a new conversation
export function useCreateConversation() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title?: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: title || 'New Chat',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: (newConversation) => {
      // Add new conversation to cache
      queryClient.setQueryData<Conversation[]>(conversationKeys.all, (old) => {
        return old ? [newConversation, ...old] : [newConversation];
      });
    },
  });
}

// Update conversation title
export function useUpdateConversationTitle() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string; }) => {
      const { error } = await supabase
        .from('conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { id, title };
    },
    onSuccess: ({ id, title }) => {
      // Update conversation in cache
      queryClient.setQueryData<Conversation[]>(conversationKeys.all, (old) => {
        return old?.map((c) =>
          c.id === id ? { ...c, title, updated_at: new Date().toISOString() } : c
        );
      });
    },
  });
}

// Delete conversation
export function useDeleteConversation() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove conversation from cache
      queryClient.setQueryData<Conversation[]>(conversationKeys.all, (old) => {
        return old?.filter((c) => c.id !== deletedId);
      });
      // Invalidate messages for this conversation
      queryClient.removeQueries({ queryKey: ['messages', deletedId] });
    },
  });
}
