# API Insight - Chrome DevTools Extension

**API Insight** is a powerful Chrome DevTools extension designed to capture, organize, and analyze network traffic with a superior developer experience. Built with Next.js and Shadcn UI, it offers a modern, clean interface for debugging APIs.

![API Insight Preview](./public/icon-128.png)

## 🚀 Key Features

### 1. **Smart Session Management**
- **Auto-Segmentation**: Automatically groups API requests by page load (refresh/navigation).
- **Session Stats**: Quickly see the breakdown of requests (Total, Images, Others) for each session.
- **Collapsible History**: Keep your workspace clean by collapsing previous sessions while focusing on the current one.

### 2. **Advanced Filtering**
- **Hide Static Assets**: One-click filter to hide images, fonts, CSS, and JS files.
- **Hide Framework Internals**: Aggressively filters out Next.js (`/_next`), Webpack, and HMR noise.
- **Hide Third-Party**: Automatically identifies and hides analytics (Google, Segment, Clerk, etc.).
- **Hide Preflight**: Option to hide HTTP `OPTIONS` requests to declutter the view.

### 3. **Rich Content Previews**
- **Deep Inspection**: Detects HTML, Images, and PDFs buried deep inside JSON responses.
- **Visual Feedback**: Shows an "Eye" icon :eye: next to inspectable content.
- **Full-Height Previews**: Opens a modal with a full-size preview of the content (HTML renders in a secure sandbox).

### 4. **Developer-First UI**
- **Resizable Panels**: Customize the width of the request list and details panel.
- **Clean JSON Viewer**: Syntax highlighting, search within JSON, and copy-assist.
- **Minimalist Table**: No clutter—just the essential methods, URLs, status, and timing.

---

## 🛠️ Development Workflow

The project is built as a **Next.js** application that exports a static site, which is then post-processed to work as a Chrome Extension.

### Prerequisites
- Node.js (v18+)
- npm

### 1. Local Development
For UI development, you can run the app in the browser using mock data.

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the interface.
*Note: Real network capture only works when loaded as an extension.*

### 2. Build for Chrome
To generate the extension package:

```bash
npm run build:extension
```

This command:
1.  Runs `next build` (Static Export).
2.  Runs `scripts/prepare-extension.js` to:
    -   Sanitize filenames (Next.js `_next` folder issue).
    -   Extract inline scripts (CSP compliance).
    -   Prepare the `out` directory.

### 3. Install in Chrome
1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** in the top right.
3.  Click **Load unpacked**.
4.  Select the `out` directory inside this project folder.
5.  Open DevTools (F12) -> **API Insight** tab.

---

## 🏗️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Directory, Static Export)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State**: React Hooks + Context

## 📁 Project Structure

- `components/api-insight`: Core extension components.
    - `api-insight-panel.tsx`: Main entry and state manager.
    - `use-network-monitor.ts`: Hook interfacing with `chrome.devtools.network`.
    - `json-viewer.tsx`: Recursive JSON tree with preview detection.
- `scripts/prepare-extension.js`: Node script for post-build CSP compliance.
- `public/devtools.js`: Extension entry point.
