"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";

// Define strict types for tool invocations to avoid 'any'
interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: unknown;
  state: "partial-call" | "call" | "result";
  result?: unknown;
}

// Extend UIMessage to include properties that might be missing in some type definitions
interface ExtendedUIMessage extends UIMessage {
  toolInvocations?: ToolInvocation[];
}

/**
 * Custom hook for managing research chat interactions.
 * Uses the AI SDK's useChat hook to communicate with the research API.
 */
export function useResearch() {
  const chat = useChat({
    // @ts-expect-error: 'api' property is valid but may not match strict type definitions in this version
    api: "/api/chat",
    maxSteps: 10,
  });

  /**
   * Sends a research query to the AI.
   * @param query - The research query string
   */
  const sendQuery = async (query: string) => {
    await chat.append({
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
      const msg = message as ExtendedUIMessage;

      // Check for direct tool invocations (newer SDK versions)
      if (msg.toolInvocations?.length) {
        return msg.toolInvocations;
      }

      // Check for tool invocations in message parts (older SDK versions/formats)
      if (message.parts) {
        return message.parts
          .filter((part) => part.type === "tool-invocation")
          .map((part) => {
            const toolPart = part as { toolInvocation: ToolInvocation; };
            return toolPart.toolInvocation;
          });
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
