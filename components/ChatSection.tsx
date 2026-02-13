"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addFeedback, addQuery, addConfidenceScore } from "@/lib/feedbackStore";

/* ── Types ─────────────────────────────────────────────────── */

interface ResultCard {
    page: number;
    paragraph: number;
    confidence: number;
    text: string;
    relevanceNote: string;
    auditStatus: "verified" | "pending";
    auditNote: string;
}

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    results?: ResultCard[];
    timestamp: Date;
}

/* ── Dummy responses ───────────────────────────────────────── */

const MOCK_RESULT_SETS: ResultCard[][] = [
    [
        {
            page: 12, paragraph: 3, confidence: 94,
            text: "Revenue increased by 23% to $4.5M in Q4 compared to the previous quarter, driven primarily by expansion in the APAC region and new enterprise contracts.",
            relevanceNote: "This section directly addresses your query about financial metrics and quarterly performance.",
            auditStatus: "verified", auditNote: "All numbers cross-referenced with appendix tables A3, A7.",
        },
        {
            page: 27, paragraph: 1, confidence: 87,
            text: "Operating expenses decreased by 8% YoY due to strategic cost optimization measures in marketing and administrative functions.",
            relevanceNote: "Provides context on profitability improvements alongside the revenue growth noted on page 12.",
            auditStatus: "verified", auditNote: "Figures consistent across income statement and segment breakdown.",
        },
        {
            page: 45, paragraph: 2, confidence: 78,
            text: "Management forecasts continued growth of 15-18% for the next fiscal year, with clean technology investments totaling $4.2 billion.",
            relevanceNote: "Forward-looking metrics that complement the historical data in your query scope.",
            auditStatus: "pending", auditNote: "Projections pending independent validation.",
        },
    ],
    [
        {
            page: 8, paragraph: 1, confidence: 91,
            text: "The company achieved record earnings per share of $3.42, surpassing analyst estimates by 12% and setting new benchmarks for the industry segment.",
            relevanceNote: "Key earnings metric directly relevant to your financial performance inquiry.",
            auditStatus: "verified", auditNote: "EPS verified against SEC filing and earnings call transcript.",
        },
        {
            page: 15, paragraph: 4, confidence: 82,
            text: "Cash reserves stood at $12.8 billion, providing substantial runway for planned acquisitions in the cleantech and AI sectors.",
            relevanceNote: "Liquidity metrics relevant to assessing the company's financial health.",
            auditStatus: "verified", auditNote: "Balance sheet figures cross-referenced with auditor's report.",
        },
    ],
];

/* ── Subcomponents ─────────────────────────────────────────── */

function ConfidenceBar({ value }: { value: number }) {
    const color = value >= 90 ? "#10b981" : value >= 70 ? "#fbbf24" : "#f97316";
    const bgColor = value >= 90 ? "bg-[#10b981]/10" : value >= 70 ? "bg-amber-50" : "bg-orange-50";
    return (
        <div className="flex items-center gap-2">
            <div className={`flex-1 h-2.5 rounded-full ${bgColor} overflow-hidden`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
            <span className="text-sm font-bold" style={{ color }}>{value}%</span>
        </div>
    );
}

function FeedbackButtons() {
    const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

    if (feedback) {
        return (
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[#10b981] font-medium mt-3"
            >
                ✓ Thanks for your feedback!
            </motion.p>
        );
    }

    return (
        <div className="flex items-center gap-3 mt-3">
            <span className="text-sm text-gray-400">Was this helpful?</span>
            <button
                onClick={() => { setFeedback("up"); addFeedback("positive"); }}
                className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-[#10b981] hover:bg-[#10b981]/10 px-3 py-1.5 rounded-lg transition-all"
            >
                👍 Yes
            </button>
            <button
                onClick={() => { setFeedback("down"); addFeedback("negative"); }}
                className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
            >
                👎 No
            </button>
        </div>
    );
}

function ResultCardView({ card, index }: { card: ResultCard; index: number }) {
    const borderColor = card.confidence >= 90 ? "#10b981" : card.confidence >= 70 ? "#fbbf24" : "#f97316";

    return (
        <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.15, duration: 0.35 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            style={{ borderLeftWidth: 4, borderLeftColor: borderColor }}
        >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-2">
                    <span className="text-base">📑</span>
                    <span className="text-base font-semibold text-[#1e293b]">
                        Page {card.page}, Paragraph {card.paragraph}
                    </span>
                </div>
                <div className="w-[160px]">
                    <ConfidenceBar value={card.confidence} />
                </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-3">
                {/* Extracted text */}
                <div className="bg-[#f8f9fb] rounded-lg p-4 text-base text-gray-600 leading-relaxed italic border-l-2 border-gray-200">
                    &ldquo;{card.text}&rdquo;
                </div>

                {/* Relevance */}
                <div className="flex gap-2">
                    <span className="text-base mt-0.5">💡</span>
                    <div>
                        <p className="text-sm font-semibold text-[#1e293b] mb-0.5">Why this is relevant:</p>
                        <p className="text-sm text-gray-500 leading-relaxed">{card.relevanceNote}</p>
                    </div>
                </div>

                {/* Audit status */}
                <div className="flex items-center gap-2 text-sm">
                    {card.auditStatus === "verified" ? (
                        <span className="flex items-center gap-1 text-[#10b981] font-semibold">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Audit Status: Verified
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-amber-500 font-semibold">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Audit Status: Pending
                        </span>
                    )}
                    <span className="text-gray-400 ml-1">— {card.auditNote}</span>
                </div>
            </div>
        </motion.div>
    );
}

/* ── Main Component ────────────────────────────────────────── */

export default function ChatSection({ uploadedFileName }: { uploadedFileName: string | null }) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hello! I'm your AI Document Assistant powered by Prism. Upload a document in the Upload tab, then come back here to ask questions about it.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showBadge, setShowBadge] = useState(true);
    const [charCount, setCharCount] = useState(0);
    // Persistent session ID for n8n Simple Memory
    const [sessionId] = useState(() => `prism-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { scrollToBottom(); }, [messages]);

    // Update welcome message when a document is uploaded
    useEffect(() => {
        if (uploadedFileName) {
            setMessages(prev => prev.map(msg =>
                msg.id === "welcome"
                    ? { ...msg, content: `Hello! I'm your AI Document Assistant powered by Prism. I've loaded "${uploadedFileName}" and I'm ready to answer your questions. Try asking about key topics, summaries, or specific details.` }
                    : msg
            ));
        }
    }, [uploadedFileName]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        setCharCount(e.target.value.length);
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isTyping) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setCharCount(0);
        setIsTyping(true);

        // Record query for analytics
        addQuery(text);

        try {
            // Call the n8n chat API route
            const res = await fetch("/api/n8n-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: text,
                    fileName: uploadedFileName || "",
                    sessionId,
                }),
            });

            const json = await res.json();

            let aiContent: string;
            let resultCards: ResultCard[] | undefined;

            if (json.success && json.data) {
                const d = json.data;

                // Handle different n8n response shapes
                if (Array.isArray(d)) {
                    // n8n returned an array of results
                    resultCards = d.map((item: Record<string, unknown>, idx: number) => ({
                        page: (item.page_number as number) || (item.page as number) || idx + 1,
                        paragraph: (item.paragraph as number) || 1,
                        confidence: (item.confidence_score as number) || (item.confidence as number) || 75,
                        text: (item.extracted_text as string) || (item.text as string) || String(item),
                        relevanceNote: (item.explanation_of_relevance as string) || (item.relevanceNote as string) || "",
                        auditStatus: ((item.audit_status as string) === "verified" ? "verified" : "pending") as "verified" | "pending",
                        auditNote: (item.audit_reasoning as string) || (item.auditNote as string) || "",
                    }));
                    aiContent = `I found ${resultCards.length} relevant section(s) in your document. Here are the results ranked by confidence:`;
                    resultCards.forEach((card) => addConfidenceScore(card.confidence));
                } else if (d.results && Array.isArray(d.results)) {
                    resultCards = d.results.map((item: Record<string, unknown>, idx: number) => ({
                        page: (item.page_number as number) || (item.page as number) || idx + 1,
                        paragraph: (item.paragraph as number) || 1,
                        confidence: (item.confidence_score as number) || (item.confidence as number) || 75,
                        text: (item.extracted_text as string) || (item.text as string) || String(item),
                        relevanceNote: (item.explanation_of_relevance as string) || (item.relevanceNote as string) || "",
                        auditStatus: ((item.audit_status as string) === "verified" ? "verified" : "pending") as "verified" | "pending",
                        auditNote: (item.audit_reasoning as string) || (item.auditNote as string) || "",
                    }));
                    aiContent = d.answer || d.message || `I found ${resultCards!.length} relevant section(s):`;
                    resultCards!.forEach((card) => addConfidenceScore(card.confidence));
                } else if (d.answer || d.message || d.output || d.response || d.text) {
                    // Simple text response from n8n
                    aiContent = d.answer || d.message || d.output || d.response || d.text;
                } else {
                    // Fallback: show whatever we got
                    aiContent = typeof d === "string" ? d : JSON.stringify(d, null, 2);
                }
            } else {
                aiContent = json.error
                    ? `Sorry, something went wrong: ${json.error}`
                    : "I received a response but couldn't parse it. Please try again.";
            }

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: aiContent,
                results: resultCards,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error("Chat error:", err);
            // Fallback to mock data on network failure
            const resultSet = MOCK_RESULT_SETS[Math.floor(Math.random() * MOCK_RESULT_SETS.length)];
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `⚠️ Could not reach the backend. Showing sample results instead.\n\nI found ${resultSet.length} relevant sections:`,
                results: resultSet,
                timestamp: new Date(),
            };
            resultSet.forEach((card) => addConfidenceScore(card.confidence));
            setMessages(prev => [...prev, aiMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="flex flex-col h-[calc(100vh-73px)]">

            {/* ── Document Context Badge ────────── */}
            <AnimatePresence>
                {showBadge && uploadedFileName && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mx-6 lg:mx-8 mt-4 bg-gradient-to-r from-[#1a4d4d] to-[#1e5555] text-white px-5 py-3 rounded-xl flex items-center justify-between shadow-sm"
                    >
                        <div className="flex items-center gap-3 text-base">
                            <span>📄</span>
                            <span className="font-medium">Currently analyzing:</span>
                            <span className="font-bold">&quot;{uploadedFileName}&quot;</span>
                        </div>
                        <button
                            onClick={() => setShowBadge(false)}
                            className="text-white/50 hover:text-white transition-colors ml-3"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Messages Area ─────────────────── */}
            <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
                <div className="max-w-3xl mx-auto space-y-5">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${msg.role === "assistant" ? "bg-[#1a4d4d] text-white" : "bg-[#e8f5f0] text-[#1a4d4d]"
                                }`}>
                                {msg.role === "assistant" ? "AI" : "U"}
                            </div>

                            {/* Content */}
                            <div className={`max-w-[80%] ${msg.role === "user" ? "" : ""}`}>
                                <div className={`rounded-2xl px-5 py-4 ${msg.role === "assistant"
                                    ? "bg-white border border-gray-100 shadow-sm"
                                    : "bg-[#1a4d4d] text-white"
                                    }`}>
                                    <p className="text-base leading-relaxed">{msg.content}</p>
                                    <p className={`text-sm mt-2 ${msg.role === "assistant" ? "text-gray-300" : "text-white/50"}`}>
                                        {formatTime(msg.timestamp)}
                                    </p>
                                </div>

                                {/* Result Cards */}
                                {msg.results && (
                                    <div className="mt-3 space-y-3">
                                        {msg.results.map((card, i) => (
                                            <ResultCardView key={i} card={card} index={i} />
                                        ))}
                                        <FeedbackButtons />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3"
                        >
                            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#1a4d4d] text-white flex items-center justify-center text-sm font-bold">AI</div>
                            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3">
                                <div className="flex gap-1.5 items-center h-5">
                                    <div className="w-2 h-2 rounded-full bg-[#1a4d4d]/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-2 h-2 rounded-full bg-[#1a4d4d]/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-2 h-2 rounded-full bg-[#1a4d4d]/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                                <p className="text-sm text-gray-400 mt-1.5">Analyzing document sections...</p>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* ── Enhanced Input Bar ────────────── */}
            <div className="border-t border-gray-100 bg-white px-6 lg:px-8 py-4">
                <div className="max-w-3xl mx-auto">
                    <div className="relative bg-[#f8f9fb] rounded-2xl border border-gray-200 focus-within:border-[#1a4d4d]/40 focus-within:ring-2 focus-within:ring-[#1a4d4d]/10 transition-all">
                        {/* Floating label */}
                        <div className={`absolute left-4 transition-all duration-200 pointer-events-none ${input ? "top-1.5 text-xs text-[#0d9488] font-semibold uppercase tracking-wider" : "top-4 text-base text-gray-400"
                            }`}>
                            {input ? "Your Question" : ""}
                        </div>

                        <textarea
                            ref={inputRef}
                            rows={3}
                            placeholder='Ask anything about your uploaded document...'
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent text-base text-[#1e293b] placeholder:text-gray-400 focus:outline-none resize-none px-5 pt-5 pb-12 min-h-[120px] leading-relaxed"
                            maxLength={1000}
                        />

                        {/* Bottom bar inside textarea */}
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                            {/* Mic icon */}
                            <button className="text-gray-300 hover:text-[#1a4d4d] transition-colors p-1.5 rounded-lg hover:bg-white">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-3">
                                {/* Char counter */}
                                <span className={`text-sm font-medium ${charCount > 900 ? "text-red-400" : "text-gray-300"}`}>
                                    {charCount}/1000
                                </span>

                                {/* Send button */}
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isTyping}
                                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${input.trim() && !isTyping
                                        ? "bg-[#1a4d4d] text-white hover:bg-[#143d3d] hover:shadow-lg hover:shadow-[#1a4d4d]/30 active:scale-95"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-400 mt-2.5 text-center">
                        Press Enter to send • Shift+Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
}
