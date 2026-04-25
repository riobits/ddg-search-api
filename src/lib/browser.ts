import { chromium, type Browser } from "playwright";
import AppError from "../errors/AppError";

// Keep this variable private to this file
let browserInstance: Browser | null = null;

const BrowserManager = {
  // 1. Initialize the browser
  async init() {
    if (browserInstance) return; // Prevent multiple initializations

    console.log("Starting Playwright browser...");
    browserInstance = await chromium.launch({
      headless: true,
      args: ["--disable-blink-features=AutomationControlled", "--no-sandbox", "--disable-dev-shm-usage"],
    });
    console.log("Browser initialized successfully.");
  },

  // 2. Get the active browser instance
  getBrowser() {
    if (!browserInstance) {
      // Throw a clear error if someone tries to use it before it's ready
      throw new AppError("BROWSER_NOT_SET", "Browser is not initialized.");
    }
    return browserInstance;
  },

  // 3. Gracefully close the browser
  async close() {
    if (browserInstance) {
      console.log("Closing Playwright browser...");
      await browserInstance.close();
      browserInstance = null;
    }
  },
};

export default BrowserManager;
