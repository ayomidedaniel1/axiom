import { google } from "@ai-sdk/google";
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from "ai";
import { z } from "zod";
import { performWebSearch } from "@/lib/tools/search";
import { scrapeUrl } from "@/lib/tools/scraper";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[]; } = await req.json();

  const result = streamText({
    model: google("gemini-3-flash"),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    system: `You are Axiom, an autonomous research agent.
    Your goal is to provide deep, verified insights.
    
    PROCESS:
    1. Use 'webSearch' to find relevant sources and high-level data.
    2. Use 'readPage' to extract specific details from the most promising URLs.
    3. If the information is still insufficient, perform a more targeted search.
    4. Provide a final report in Markdown with a "Sources" section at the end.
    
    STRICT RULE: Only use information found in the search results. Do not hallucinate.`,

    tools: {
      webSearch: tool({
        description: "Search the web for information",
        inputSchema: z.object({
          query: z.string().describe("The search query"),
        }),
        execute: async ({ query }: { query: string; }) => {
          const results = await performWebSearch(query);
          return { results };
        },
      }),
      readPage: tool({
        description: "Scrape and read a URL.",
        inputSchema: z.object({
          url: z.string().describe("The URL to scrape"),
        }),
        execute: async ({ url }: { url: string; }) => {
          const content = await scrapeUrl(url);
          return { content };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}