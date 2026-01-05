"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";

/**
 * Tool invocation part type for extracting tool calls from messages.
 */
interface ToolInvocationPart {
  type: "tool-invocation";
  toolInvocation: {
    toolCallId: string;
    toolName: string;
    args: unknown;
    state: "partial-call" | "call" | "result";
    result?: unknown;
  };
}

/**
 * Custom hook for managing research chat interactions.
 * Uses the AI SDK's useChat hook to communicate with the research API.
 */
export function useResearch() {
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  /**
   * Sends a research query to the AI.
   * @param query - The research query string
   */
  const sendQuery = async (query: string) => {
    // In SDK 6.0/UI 3.0, sendMessage is the preferred method
    // It automatically handles appending and submission
    chat.sendMessage({
      role: "user",
      content: query,
    });
  };

  /**
   * Extracts tool invocations from all messages.
   * Useful for displaying research steps in the UI.
   */
  const getToolInvocations = () => {
    return chat.messages.flatMap((message: UIMessage) => {
      // Prioritize checking parts for modern tool invocations
      if (message.parts) {
        return message.parts
          .filter((part): part is ToolInvocationPart => part.type === "tool-invocation")
          .map((part) => part.toolInvocation);
      }

      return [];
    });
  };

  /**
   * Checks if the research is currently in progress.
   */
  const isLoading = chat.status === "streaming" || chat.status === "submitted";

  return {
    ...chat,
    isLoading,
    sendQuery,
    getToolInvocations,
  };
}
