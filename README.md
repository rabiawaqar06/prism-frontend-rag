# AI Document Viewer

An AI-assisted document analysis tool built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

## Features

- **PDF Upload** — Drag-and-drop or file picker with 10 MB / PDF-only validation
- **URL Input** — Paste a direct link to a hosted PDF
- **Natural Language Queries** — Ask questions about document content
- **Analysis Results** — Extracted text, page numbers, relevance explanations, confidence scores, and full audit reasoning
- **Demo Mode** — Toggle mock data to preview the UI without a backend
- **Responsive** — Works on desktop and mobile

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

Create a `.env.local` file (already included):

```env
NEXT_PUBLIC_WEBHOOK_URL=https://your-backend-url.com/api/analyze
```

When the webhook URL is set, the app sends a POST request with:

```json
{ "query": "...", "fileUrl": "..." }
```

And expects a response matching:

```json
{
  "extracted_text": "...",
  "page_number": 12,
  "explanation_of_relevance": "...",
  "confidence_score": 95,
  "audit_reasoning": "..."
}
```

## Tech Stack

| Layer     | Technology         |
|-----------|--------------------|
| Framework | Next.js 14 (App Router) |
| Language  | TypeScript         |
| Styling   | Tailwind CSS       |
| State     | React hooks        |

## Project Structure

```
app/
  layout.tsx          # Root layout with metadata
  page.tsx            # Main page (client component)
  globals.css         # Tailwind directives + custom CSS
components/
  Sidebar.tsx         # Navigation sidebar
  UploadSection.tsx   # PDF upload dropzone + URL input
  QuerySection.tsx    # Query text area with char counter
  ResultsSection.tsx  # Results container
  ResultCard.tsx      # Individual result card
  ConfidenceScore.tsx # Circular confidence indicator
  SkeletonLoader.tsx  # Loading skeleton placeholders
lib/
  types.ts            # TypeScript interfaces
  mock-data.ts        # Mock results + webhook URL config
```
