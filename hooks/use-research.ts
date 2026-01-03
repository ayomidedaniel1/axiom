import { useChat } from "@ai-sdk/react";
import { UIToolInvocation } from "ai";

// Type Guard to safely check for toolInvocations without using 'any'
function hasToolInvocation(part: unknown): part is { toolInvocation: UIToolInvocation<unknown>; } {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    (part as { type: string; }).type === "tool-invocation" &&
    "toolInvocation" in part
  );
}

export function useResearch() {
  const { messages, setMessages, sendMessage } = useChat({
    // 'api' and 'maxSteps' removed to satisfy your strict type definition.
    // Ensure your API route is at src/app/api/chat/route.ts
  });

  function getResearchSteps(): Array<UIToolInvocation<unknown>> {
    if (!messages) return [];

    return messages.flatMap((message) => {
      if (!message.parts) return [];

      return message.parts
        .filter(hasToolInvocation)
        .map((part) => part.toolInvocation);
    });
  }

  return {
    messages,
    sendMessage,
    setMessages,
    steps: getResearchSteps(),
  };
}