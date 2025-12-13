# API Insight - Chrome DevTools Extension

**API Insight** is a powerful Chrome DevTools extension designed to capture, organize, and analyze network traffic with a superior developer experience. Built with Next.js and Shadcn UI, it offers a modern, clean interface for debugging APIs.


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

### 4. **Instant Request Replay**
- **Modify & Resend**: Edit methods, headers, and body payloads to endlessly test API endpoints.
- **Strict Headers**: Automatically sanitizes headers to ensure successful replay without CORS or browser errors.

### 5. **WebSocket Inspection**
- **Real-Time Frames**: View WebSocket messages in real-time as they are sent and received.
- **Visual Grouping**: Sent and received frames are visually distinct for easy following of the conversation.

### 6. **Developer-First UI**
- **Resizable Panels**: Customize the width of the request list and details panel.
- **Clean JSON Viewer**: Syntax highlighting, search within JSON, and copy-assist.
- **Minimalist Table**: No clutter—just the essential methods, URLs, status, and timing.