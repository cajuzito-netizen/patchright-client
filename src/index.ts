/**
 * Patchright Client
 * 
 * Use this on YOUR machine to control browsers on the SERVER.
 * 
 * Usage:
 *   import { PatchrightClient } from 'patchright-client';
 *   
 *   const client = new PatchrightClient('http://server:8000');
 *   
 *   const browser = await client.newBrowser('my-account');
 *   const page = await browser.newPage();
 *   
 *   await page.goto('https://example.com');
 *   await page.click('#button');
 *   const html = await page.content();
 */

export interface BrowserInfo {
  id: string;
  profileName: string;
}

export interface PageInfo {
  id: string;
  url: string;
  title: string;
}

export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number | null;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ==================== Page ====================

export class Page {
  constructor(
    private client: PatchrightClient,
    private browserId: string,
    private pageId: string
  ) {}

  get id(): string {
    return this.pageId;
  }

  /**
   * Navigate to URL
   */
  async goto(url: string): Promise<{ url: string; title: string }> {
    return this.client.post<{ url: string; title: string }>(
      `/browsers/${this.browserId}/pages/${this.pageId}/goto`,
      { url }
    );
  }

  /**
   * Click an element
   */
  async click(selector: string): Promise<void> {
    await this.client.post(
      `/browsers/${this.browserId}/pages/${this.pageId}/click`,
      { selector }
    );
  }

  /**
   * Fill an input field
   */
  async fill(selector: string, value: string): Promise<void> {
    await this.client.post(
      `/browsers/${this.browserId}/pages/${this.pageId}/fill`,
      { selector, value }
    );
  }

  /**
   * Type text character by character
   */
  async type(selector: string, text: string): Promise<void> {
    await this.client.post(
      `/browsers/${this.browserId}/pages/${this.pageId}/type`,
      { selector, text }
    );
  }

  /**
   * Evaluate JavaScript on the page
   */
  async evaluate<T = unknown>(script: string): Promise<T> {
    const result = await this.client.post<{ result: T }>(
      `/browsers/${this.browserId}/pages/${this.pageId}/eval`,
      { script }
    );
    return result.result;
  }

  /**
   * Take a screenshot
   * @returns Base64 encoded PNG image
   */
  async screenshot(): Promise<string> {
    const result = await this.client.post<{ screenshot: string }>(
      `/browsers/${this.browserId}/pages/${this.pageId}/screenshot`,
      {}
    );
    return result.screenshot;
  }

  /**
   * Get page HTML content
   */
  async content(): Promise<string> {
    const result = await this.client.get<{ html: string }>(
      `/browsers/${this.browserId}/pages/${this.pageId}/content`
    );
    return result.html;
  }
}

// ==================== Browser ====================

export class Browser {
  constructor(
    private client: PatchrightClient,
    public readonly id: string,
    public readonly profileName: string
  ) {}

  /**
   * Create a new page (tab)
   */
  async newPage(): Promise<Page> {
    const result = await this.client.post<PageInfo>(
      `/browsers/${this.id}/pages`,
      {}
    );
    return new Page(this.client, this.id, result.id);
  }

  /**
   * Get all cookies
   */
  async cookies(): Promise<Cookie[]> {
    const result = await this.client.get<{ cookies: Cookie[] }>(
      `/browsers/${this.id}/cookies`
    );
    return result.cookies;
  }

  /**
   * Close this browser and all its pages
   */
  async close(): Promise<void> {
    await this.client.delete(`/browsers/${this.id}`);
  }
}

// ==================== Client ====================

export class PatchrightClient {
  constructor(private baseUrl: string) {}

  /**
   * Make a POST request
   */
  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = await res.json() as ApiResponse<T>;
    if (!json.success) {
      throw new Error(json.message || 'Request failed');
    }
    return json.data as T;
  }

  /**
   * Make a GET request
   */
  async get<T = unknown>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`);
    const json = await res.json() as ApiResponse<T>;
    if (!json.success) {
      throw new Error(json.message || 'Request failed');
    }
    return json.data as T;
  }

  /**
   * Make a DELETE request
   */
  async delete(path: string): Promise<void> {
    await fetch(`${this.baseUrl}${path}`, { method: 'DELETE' });
  }

  /**
   * Create a new browser (Chrome context on server)
   * 
   * @param profileName - Name for this profile's data (cookies, etc.)
   * @returns Browser you can create pages in
   */
  async newBrowser(profileName: string): Promise<Browser> {
    const result = await this.post<{ id: string }>(
      '/browsers',
      { profileName }
    );
    return new Browser(this, result.id, profileName);
  }

  /**
   * List all active browsers
   */
  async listBrowsers(): Promise<BrowserInfo[]> {
    return this.get<BrowserInfo[]>('/browsers');
  }
}

export default PatchrightClient;
