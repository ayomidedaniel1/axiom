import { useChat } from "@ai-sdk/react";
import { ToolInvocation } from "ai";

export function useResearch() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/research",
    maxSteps: 10,
  });

  /**
   * Parse the message history to extract tool invocations.
   * We use the 'ToolInvocation' type from 'ai' which is the base type.
   */
  function getResearchSteps(): Array<ToolInvocation> {
    if (!messages) return [];

    return messages.flatMap((message) => {
      // Handle potential undefined parts or legacy text-only messages
      if (!message.parts) return [];

      return message.parts
        .filter((part) => part.type === 'tool-invocation')
        .map((part) => part.toolInvocation);
    });
  }

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    steps: getResearchSteps(),
  };
}