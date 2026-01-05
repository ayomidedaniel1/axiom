import { useChat } from "@ai-sdk/react";
import { ResearchStep } from "@/components/research/thought-log";

export function useResearch() {
  const { messages, sendMessage, setMessages, status } = useChat();

  const isLoading = status === "submitted" || status === "streaming";

  function getResearchSteps(): ResearchStep[] {
    if (!messages) return [];

    return messages.flatMap((message) => {
      // Safety check for message parts
      if (!message.parts) return [];

      return message.parts
        .filter((part) => part.type === "tool-invocation")
        .map((part) => {
          // Type Assertion to fix the "TextPart" conflict
          const tool = (part as unknown as {
            toolInvocation: {
              toolCallId: string;
              toolName: string;
              args: unknown;
              state: string;
              result?: unknown;
            };
          }).toolInvocation;

          // Safe access to input arguments
          const inputData = tool.args ?? (tool as unknown as { input: unknown; }).input;

          return {
            id: tool.toolCallId,
            toolName: tool.toolName,
            input: inputData,
            isComplete: tool.state === 'result',
            result: tool.state === 'result' ? tool.result : undefined,
          };
        });
    });
  }

  return {
    messages,
    sendMessage,
    setMessages,
    steps: getResearchSteps(),
    isLoading,
  };
}