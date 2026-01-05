import { useChat } from "@ai-sdk/react";
import { ResearchStep } from "@/components/research/thought-log";

export function useResearch() {
  const { messages, sendMessage, setMessages, status, error } = useChat();

  const isLoading = status === "submitted" || status === "streaming";

  // Parse error for user-friendly display
  const getErrorInfo = () => {
    if (!error) return null;

    // Try to extract structured error from API response
    const errorMessage = error.message || "An unexpected error occurred";

    // Check for common error patterns
    if (errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      return {
        title: "Rate limit exceeded",
        message: "You've reached the free tier API limit. Please wait a few minutes before trying again.",
        type: "rate_limit" as const,
      };
    }

    if (errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("API key")) {
      return {
        title: "Authentication error",
        message: "Please check that your API key is configured correctly.",
        type: "auth" as const,
      };
    }

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return {
        title: "Connection error",
        message: "Unable to connect to the AI service. Please check your internet connection.",
        type: "network" as const,
      };
    }

    return {
      title: "Something went wrong",
      message: "An unexpected error occurred. Please try again.",
      type: "unknown" as const,
    };
  };

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
    error,
    errorInfo: getErrorInfo(),
  };
}