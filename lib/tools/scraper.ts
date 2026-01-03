export async function scrapeUrl(url: string): Promise<string> {
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to scrape: ${response.statusText}`);
    }

    const text = await response.text();
    // Jina returns a mix of metadata and content; we grab the core body
    return text.slice(0, 15000); // Limit to ~15k chars for context window safety
  } catch (error) {
    console.error("Scraper Error:", error);
    return "Failed to extract content from this source.";
  }
}