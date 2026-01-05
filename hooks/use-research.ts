import { useChat } from "@ai-sdk/react";
import { ResearchStep } from "@/components/research/thought-log";

interface ToolPart {
  type: "tool-invocation";
  toolInvocation: {
    toolCallId: string;
    toolName: string;
    args?: unknown;
    state?: string;
  };
}

function isToolPart(part: unknown): part is ToolPart {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    (part as { type: string; }).type === "tool-invocation" &&
    "toolInvocation" in part
  );
}

export function useResearch() {
  const { messages, sendMessage, setMessages } = useChat();

  /**
   * extracting and standardizing tool steps
   */
  function getResearchSteps(): ResearchStep[] {
    if (!messages) return [];

    return messages.flatMap((message) => {
      if (!message.parts) return [];

      return message.parts
        .filter((part) => part.type === "tool-invocation")
        .map((part) => {
          const tool = (part as unknown as {
            toolInvocation: {
              toolCallId: string;
              toolName: string;
              args: unknown;
              state: string;
              result?: unknown;
            };
          }).toolInvocation;

          const inputData = tool.args ?? (tool as unknown as { input: unknown; }).input;

          return {
            id: tool.toolCallId,
            toolName: tool.toolName,
            input: inputData,
            isComplete: tool.state === 'result',
            result: tool.result,
          };
        });
    });
  }

  return {
    messages,
    sendMessage,
    setMessages,
    steps: getResearchSteps(),
  };
}