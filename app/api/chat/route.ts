import { google } from "@ai-sdk/google";
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from "ai";
import { z } from "zod";
import { performWebSearch } from "@/lib/tools/search";
import { scrapeUrl } from "@/lib/tools/scraper";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[]; } = await req.json();

    const result = streamText({
      model: google("gemini-3-flash-preview"),
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
  } catch (error: unknown) {
    // Parse error details
    const errorObj = error as { statusCode?: number; message?: string; cause?: { statusCode?: number; }; };
    const statusCode = errorObj.statusCode || errorObj.cause?.statusCode || 500;
    const errorMessage = errorObj.message || "An unexpected error occurred";

    // User-friendly error messages based on error type
    let userMessage: string;
    let action: string;

    if (statusCode === 429 || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      userMessage = "API rate limit exceeded";
      action = "You've reached the free tier limit for the Gemini API. Please wait a few minutes before trying again, or upgrade to a paid plan at https://ai.google.dev for higher limits.";
    } else if (statusCode === 401 || statusCode === 403) {
      userMessage = "API authentication failed";
      action = "Please check that your GOOGLE_GENERATIVE_AI_API_KEY environment variable is set correctly.";
    } else if (statusCode === 400) {
      userMessage = "Invalid request";
      action = "The request could not be processed. Please try rephrasing your question.";
    } else if (statusCode >= 500) {
      userMessage = "AI service temporarily unavailable";
      action = "The Gemini API is experiencing issues. Please try again in a few moments.";
    } else {
      userMessage = "Something went wrong";
      action = "An unexpected error occurred. Please try again or check the console for details.";
    }

    console.error("[Chat API Error]", { statusCode, errorMessage });

    return Response.json(
      { error: userMessage, action, statusCode },
      { status: statusCode }
    );
  }
}