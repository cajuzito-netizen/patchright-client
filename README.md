# Patchright Client

Client library for [Patchright Service](https://github.com/cajuzito-netizen/patchright-service) - remote browser automation with stealth.

## Install

```bash
# Using pnpm
pnpm add github:cajuzito-netizen/patchright-client

# Or copy src/index.ts directly to your project
```

## Usage

```typescript
import { PatchrightClient } from 'patchright-client';

// Connect to your server
const client = new PatchrightClient('http://your-server:8000');

// Create browser (Chrome on server)
const browser = await client.newBrowser('my-account');

// Create page (tab on server)
const page = await browser.newPage();

// Navigate
await page.goto('https://example.com');

// Interact
await page.click('#button');
await page.fill('#input', 'hello');

// Get data
const html = await page.content();
const screenshot = await page.screenshot();
const cookies = await browser.cookies();

// Cleanup
await browser.close();
```

## API

### PatchrightClient

```typescript
const client = new PatchrightClient('http://server:8000');
const browser = await client.newBrowser('profile-name');
```

### Browser

```typescript
browser.id              // Browser ID
browser.profileName     // Profile name
browser.newPage()       // Create new page
browser.cookies()       // Get cookies
browser.close()         // Close browser
```

### Page

```typescript
page.goto(url)                    // Navigate
page.click(selector)              // Click element
page.fill(selector, value)        // Fill input
page.type(selector, text)         // Type text
page.evaluate(script)             // Run JavaScript
page.screenshot()                 // Take screenshot (returns base64)
page.content()                    // Get HTML
```

## Setup

See [Patchright Service](https://github.com/cajuzito-netizen/patchright-service) for server setup.
