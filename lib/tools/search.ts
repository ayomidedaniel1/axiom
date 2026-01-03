import { Citation } from "@/types/research";

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface TavilyResponse {
  results: Array<TavilySearchResult>;
}

export async function performWebSearch(query: string): Promise<Array<Citation>> {
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: "advanced",
        max_results: 5,
        // include_raw_content: false,
      }),
    });

    if (!response.ok) {
      throw new Error("Tavily search failed");
    }

    const data: TavilyResponse = await response.json();

    return data.results.map((result: TavilySearchResult) => ({
      sourceName: result.title,
      url: result.url,
      excerpt: result.content,
    }));
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
}