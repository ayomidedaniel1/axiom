export const MOCK_STEPS = [
  {
    toolCallId: "call_1",
    toolName: "webSearch",
    args: { query: "Next.js 15 Server Actions limits" },
    state: "result",
    result: { results: [{ title: "Next.js Docs", url: "nextjs.org", excerpt: "Server Actions..." }] },
  },
  {
    toolCallId: "call_2",
    toolName: "readPage",
    args: { url: "https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions" },
    state: "call",
  },
];

export const MOCK_MESSAGES = [
  { role: "user", content: "What are the limits of Server Actions in Next.js 15?" },
  { role: "assistant", content: "I'm researching the latest documentation on Server Actions..." },
];