'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

// Types
export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Query keys
export const messageKeys = {
  all: ['messages'] as const,
  byConversation: (conversationId: string) => ['messages', conversationId] as const,
};

// Fetch messages for a conversation
export function useMessages(conversationId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: messageKeys.byConversation(conversationId || ''),
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });
}

// Save a message
export function useSaveMessage() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      role,
      content,
      metadata = {},
    }: {
      conversationId: string;
      role: 'user' | 'assistant';
      content: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role,
          content,
          metadata,
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data as Message;
    },
    onSuccess: (newMessage) => {
      // Add message to cache
      queryClient.setQueryData<Message[]>(
        messageKeys.byConversation(newMessage.conversation_id),
        (old) => {
          return old ? [...old, newMessage] : [newMessage];
        }
      );
      // Invalidate conversations to update the updated_at timestamp
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Delete all messages in a conversation (useful for clearing chat)
export function useClearMessages() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (error) throw error;
      return conversationId;
    },
    onSuccess: (conversationId) => {
      // Clear messages from cache
      queryClient.setQueryData<Message[]>(
        messageKeys.byConversation(conversationId),
        []
      );
    },
  });
}
