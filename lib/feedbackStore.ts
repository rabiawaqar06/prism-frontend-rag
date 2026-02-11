/**
 * Shared feedback store backed by localStorage.
 * ChatSection writes to it, AnalyticsSection reads from it.
 */

const STORAGE_KEY = "prism_feedback";
const DOCS_KEY = "prism_documents";
const QUERIES_KEY = "prism_queries";
const CONFIDENCE_KEY = "prism_confidence";

export interface FeedbackEntry {
    id: string;
    type: "positive" | "negative";
    timestamp: number;
}

export interface DocumentEntry {
    id: string;
    name: string;
    size: number;
    timestamp: number;
}

export interface QueryEntry {
    id: string;
    query: string;
    timestamp: number;
}

export interface ConfidenceEntry {
    id: string;
    score: number;
    timestamp: number;
}

/* ── Generic helpers ──────────────────────────────────────── */

function getItems<T>(key: string): T[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveItems<T>(key: string, items: T[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(items));
}

/* ── Feedback ─────────────────────────────────────────────── */

/** Record a new feedback vote */
export function addFeedback(type: "positive" | "negative") {
    const entries = getItems<FeedbackEntry>(STORAGE_KEY);
    entries.push({ id: Date.now().toString(), type, timestamp: Date.now() });
    saveItems(STORAGE_KEY, entries);
    window.dispatchEvent(new Event("prism_feedback_update"));
}

/** Get summary stats */
export function getFeedbackStats() {
    const entries = getItems<FeedbackEntry>(STORAGE_KEY);
    const positive = entries.filter((e) => e.type === "positive").length;
    const negative = entries.filter((e) => e.type === "negative").length;
    const total = positive + negative;
    return {
        positive,
        negative,
        total,
        positivePercent: total > 0 ? Math.round((positive / total) * 100) : 0,
        negativePercent: total > 0 ? Math.round((negative / total) * 100) : 0,
    };
}

/* ── Documents ────────────────────────────────────────────── */

/** Record a newly uploaded document */
export function addDocument(name: string, size: number) {
    const docs = getItems<DocumentEntry>(DOCS_KEY);
    // Avoid duplicates for the same name uploaded in rapid succession
    if (docs.length > 0 && docs[docs.length - 1].name === name) return;
    docs.push({ id: Date.now().toString(), name, size, timestamp: Date.now() });
    saveItems(DOCS_KEY, docs);
    window.dispatchEvent(new Event("prism_data_update"));
}

/** Get all uploaded documents (most recent first) */
export function getDocuments(): DocumentEntry[] {
    return getItems<DocumentEntry>(DOCS_KEY).reverse();
}

/* ── Queries ──────────────────────────────────────────────── */

/** Record a user query from chat */
export function addQuery(query: string) {
    const queries = getItems<QueryEntry>(QUERIES_KEY);
    queries.push({ id: Date.now().toString(), query, timestamp: Date.now() });
    saveItems(QUERIES_KEY, queries);
    window.dispatchEvent(new Event("prism_data_update"));
}

/** Get aggregated query counts (most frequent first, max 5) */
export function getQueryStats(): { query: string; count: number }[] {
    const queries = getItems<QueryEntry>(QUERIES_KEY);
    const counts: Record<string, number> = {};
    for (const q of queries) {
        const key = q.query.trim();
        counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
}

/** Get all queries (most recent first) */
export function getQueries(): QueryEntry[] {
    return getItems<QueryEntry>(QUERIES_KEY).reverse();
}

/* ── Confidence Scores ────────────────────────────────────── */

/** Record a confidence score from a chat result card */
export function addConfidenceScore(score: number) {
    const entries = getItems<ConfidenceEntry>(CONFIDENCE_KEY);
    entries.push({ id: Date.now().toString(), score, timestamp: Date.now() });
    saveItems(CONFIDENCE_KEY, entries);
    window.dispatchEvent(new Event("prism_data_update"));
}

/** Get aggregated confidence statistics */
export function getConfidenceStats() {
    const entries = getItems<ConfidenceEntry>(CONFIDENCE_KEY);
    const total = entries.length;
    if (total === 0) {
        return { average: 0, high: 0, medium: 0, low: 0, uncertain: 0, total: 0 };
    }
    const sum = entries.reduce((acc, e) => acc + e.score, 0);
    const average = Math.round(sum / total);
    const high = entries.filter((e) => e.score >= 90).length;
    const medium = entries.filter((e) => e.score >= 70 && e.score < 90).length;
    const low = entries.filter((e) => e.score >= 50 && e.score < 70).length;
    const uncertain = entries.filter((e) => e.score < 50).length;
    return {
        average,
        high: Math.round((high / total) * 100),
        medium: Math.round((medium / total) * 100),
        low: Math.round((low / total) * 100),
        uncertain: Math.round((uncertain / total) * 100),
        total,
    };
}
