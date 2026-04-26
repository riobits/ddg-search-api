import { ofetch } from "ofetch";
import * as cheerio from "cheerio";

const targetUrl = "https://lite.duckduckgo.com/lite";
const LINK_SELECTOR = ".result-link";
const DESCRIPTION_SELECTOR = ".result-snippet";
const SPONSORED_SELECTOR = ".result-sponsored";

interface SearchResult {
  title: string | null;
  description: string | null;
  url: string | null;
}

interface SearchQuery {
  q: string; // The search query string
  kl?: string; // Optional: The region code for the search (e.g., "us-en" for United States English)
  kp?: number; // Optional: The safe search level (0 = On, -1 = Moderate, -2 = Off)
}

async function search(searchQuery: SearchQuery): Promise<SearchResult[]> {
  try {
    const text = await ofetch(targetUrl, {
      proxy: Bun.env.WEBSHARE_ROTATING_PROXY!,
      timeout: 5000,
      retry: 3,
      responseType: "text",
      method: "GET",
      query: { ...searchQuery },
    });

    if (Bun.env.NODE_ENV === "development") {
      Bun.file("search-results.html").write(text);
    }

    const $ = cheerio.load(text);

    // Check for sponsored results and remove them from the results
    $(SPONSORED_SELECTOR).each((_, element) => {
      const sponsoredLink = $(element).find(LINK_SELECTOR);
      if (sponsoredLink.length > 0) {
        sponsoredLink.remove();
      }
    });

    const results: SearchResult[] = [];

    $(LINK_SELECTOR).each((_, element) => {
      const title = $(element).text().trim();
      const ddgUrl = $(element).attr("href") || null;
      let url: string | null = null;

      if (ddgUrl && ddgUrl.startsWith("//")) {
        const tempUrl = new URL(`https:${ddgUrl}`);
        url = tempUrl.searchParams.get("uddg");
      } else if (ddgUrl) {
        url = ddgUrl;
      }

      results.push({ url, title, description: null });
    });

    $(DESCRIPTION_SELECTOR).each((index, element) => {
      const description = $(element).text().trim();
      if (results[index]) {
        results[index].description = description;
      }
    });

    return results;
  } catch (err) {
    console.error("Error searching DuckDuckGo:", err);
    return [];
  }
}

export default search;
