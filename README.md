# VIBE ~ CHUCK

Will you pass the **VIBE CHUCK**?

## Overview

VIBE CHUCK is a social media app for sharing and rating holiday decorations in Charleston and beyond. Users can post photos of their favorite holiday displays, browse decorations by event, and vote for the best ones. The app ranks decorations based on popularity and freshness, helping people discover the most impressive holiday displays in their area.

## Getting Started

To run the VIBE CHUCK frontend locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Visit http://localhost:5173 in your browser
```

The app requires the PocketBase backend (vibecheckr) to be running. You can configure the PocketBase URL using the `VITE_POCKETBASE_URL` environment variable. If not set, it defaults to `http://localhost:8090`.

You can create a `.env` file in the project root with:

```
VITE_POCKETBASE_URL=https://your-pocketbase-url.com
```

---
<sub><sup>2024 TCP Software, LLC</sup></sub>
<sub><sup>Made with pocketbase and skeleton ui</sup></sub>
