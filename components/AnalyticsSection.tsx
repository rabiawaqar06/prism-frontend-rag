"use client";

import React, { useState, useEffect } from "react";
import { getFeedbackStats, getDocuments, getQueryStats, getConfidenceStats, getQueries, type DocumentEntry } from "@/lib/feedbackStore";

/* ── Circular Gauge ───────────────────────────────────────── */

function CircularGauge({
    value,
    max = 100,
    size = 110,
    strokeWidth = 10,
    gradientId = "gaugeGrad",
    color = false,
}: {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    gradientId?: string;
    color?: boolean;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = value / max;
    const dashOffset = circumference * (1 - pct);

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-700"
                />
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color ? "#10b981" : "#1a4d4d"} />
                        <stop offset="100%" stopColor={color ? "#34d399" : "#2d7a6e"} />
                    </linearGradient>
                </defs>
            </svg>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-[#1e293b]">{value}%</span>
            </div>
        </div>
    );
}

/* ── Main Component ───────────────────────────────────────── */

export default function AnalyticsSection() {
    const [feedbackStats, setFeedbackStats] = useState({ positive: 0, negative: 0, total: 0, positivePercent: 0, negativePercent: 0 });
    const [recentDocs, setRecentDocs] = useState<DocumentEntry[]>([]);
    const [topQueries, setTopQueries] = useState<{ query: string; count: number }[]>([]);
    const [confidenceStats, setConfidenceStats] = useState({ average: 0, high: 0, medium: 0, low: 0, uncertain: 0, total: 0 });
    const [totalQueries, setTotalQueries] = useState(0);

    useEffect(() => {
        // Read initial data
        setFeedbackStats(getFeedbackStats());
        setRecentDocs(getDocuments());
        setTopQueries(getQueryStats());
        setConfidenceStats(getConfidenceStats());
        setTotalQueries(getQueries().length);

        // Listen for real-time updates
        const feedbackHandler = () => setFeedbackStats(getFeedbackStats());
        const dataHandler = () => {
            setRecentDocs(getDocuments());
            setTopQueries(getQueryStats());
            setConfidenceStats(getConfidenceStats());
            setTotalQueries(getQueries().length);
        };
        window.addEventListener("prism_feedback_update", feedbackHandler);
        window.addEventListener("prism_data_update", dataHandler);
        return () => {
            window.removeEventListener("prism_feedback_update", feedbackHandler);
            window.removeEventListener("prism_data_update", dataHandler);
        };
    }, []);

    const formatTimeAgo = (ts: number) => {
        const diff = Date.now() - ts;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const satisfactionPercent = feedbackStats.total > 0 ? feedbackStats.positivePercent : 0;

    // Quality Index: weighted composite of docs, confidence, queries, and satisfaction
    const qualityIndex = (() => {
        const docScore = Math.min(recentDocs.length * 10, 100); // 0-100, max at 10 docs
        const confScore = confidenceStats.average; // 0-100
        const queryScore = Math.min(totalQueries * 5, 100); // 0-100, max at 20 queries
        const satScore = satisfactionPercent; // 0-100
        const hasData = recentDocs.length > 0 || totalQueries > 0 || confidenceStats.total > 0;
        if (!hasData) return 0;
        // Weighted: confidence 40%, satisfaction 25%, docs 20%, queries 15%
        return Math.round(confScore * 0.4 + satScore * 0.25 + docScore * 0.2 + queryScore * 0.15);
    })();

    // Live top 3 stat cards
    const liveStats = [
        {
            label: "Documents Analyzed",
            value: recentDocs.length.toString(),
            unit: "docs",
            icon: (
                <svg className="w-7 h-7 text-[#1a4d4d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            ),
        },
        {
            label: "Avg. Confidence Score",
            value: confidenceStats.total > 0 ? confidenceStats.average.toString() : "—",
            unit: confidenceStats.total > 0 ? "/100" : "",
            icon: (
                <svg className="w-7 h-7 text-[#1a4d4d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
            ),
        },
        {
            label: "Queries Processed",
            value: totalQueries.toString(),
            unit: "queries",
            icon: (
                <svg className="w-7 h-7 text-[#1a4d4d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="px-6 py-5 space-y-5">

            {/* ── Top Stats Row (3 live cards) ──────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {liveStats.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-[#1a4d4d]/8 flex items-center justify-center flex-shrink-0">
                                {stat.icon}
                            </div>
                            <p className="text-sm text-gray-400 font-semibold uppercase tracking-wide">
                                {stat.label}
                            </p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-[#1e293b] leading-none">
                                {stat.value}
                            </span>
                            {stat.unit && (
                                <span className="text-base text-gray-400 font-medium">
                                    {stat.unit}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Middle Row: Gauges (2 cards) ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* User Satisfaction — live from chat feedback */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-[#1e293b] mb-4 self-start">
                        User Satisfaction
                    </h3>
                    {feedbackStats.total > 0 ? (
                        <>
                            <CircularGauge value={satisfactionPercent} size={160} strokeWidth={14} gradientId="gaugeUS" color />
                            <div className="space-y-3 mt-5 w-full text-base">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">👍</span>
                                        <span className="text-gray-500">Positive</span>
                                    </div>
                                    <span className="font-semibold text-[#10b981]">{feedbackStats.positivePercent}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">👎</span>
                                        <span className="text-gray-500">Negative</span>
                                    </div>
                                    <span className="font-semibold text-red-400">{feedbackStats.negativePercent}%</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-3">
                                Based on <span className="font-semibold text-[#1e293b]">{feedbackStats.total}</span> response{feedbackStats.total !== 1 ? "s" : ""}
                            </p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                            </div>
                            <p className="text-base font-medium text-gray-400">No feedback yet</p>
                            <p className="text-sm text-gray-300 mt-1">Chat feedback will appear here</p>
                        </div>
                    )}
                </div>

                {/* Confidence Rate */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-[#1e293b] mb-4 self-start">
                        Confidence Rate
                    </h3>
                    {confidenceStats.total > 0 ? (
                        <>
                            <CircularGauge value={confidenceStats.average} size={160} strokeWidth={14} gradientId="gaugeCR" />
                            <div className="grid grid-cols-2 gap-x-10 gap-y-2.5 mt-5 text-base">
                                {[
                                    { label: "High Confidence", pct: `${confidenceStats.high}%` },
                                    { label: "Medium", pct: `${confidenceStats.medium}%` },
                                    { label: "Low", pct: `${confidenceStats.low}%` },
                                    { label: "Uncertain", pct: `${confidenceStats.uncertain}%` },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between gap-3">
                                        <span className="text-gray-500">{item.label}</span>
                                        <span className="font-semibold text-[#1e293b]">{item.pct}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-400 mt-3">{confidenceStats.total} score{confidenceStats.total !== 1 ? "s" : ""} recorded</p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CircularGauge value={0} size={160} strokeWidth={14} gradientId="gaugeCR" />
                            <p className="text-base font-medium text-gray-400 mt-4">No confidence data yet</p>
                            <p className="text-sm text-gray-300 mt-1">Chat responses will populate this card</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bottom Row: Index + Docs + Queries + CTA ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                {/* Left column: stacked cards */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* Quality Index pill */}
                    <div className="bg-[#f0fdf4] rounded-2xl border border-emerald-100 p-6 flex items-center gap-5">
                        <div className="relative">
                            <CircularGauge value={qualityIndex} size={72} strokeWidth={8} gradientId="gaugeQI" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-[#1e293b]">Analysis Quality Index</h4>
                            <p className="text-base text-gray-500 mt-0.5">
                                {qualityIndex > 0
                                    ? "Composite score from confidence, satisfaction, docs & queries"
                                    : "Interact with Prism to build your quality score"}
                            </p>
                        </div>
                    </div>

                    {/* Recent Documents — live from uploads */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[#1e293b]">Recent Documents</h3>
                            {recentDocs.length > 0 && (
                                <span className="text-sm font-semibold text-[#1a4d4d] bg-[#1a4d4d]/10 px-3 py-1 rounded-full">
                                    {recentDocs.length}
                                </span>
                            )}
                        </div>
                        {recentDocs.length > 0 ? (
                            <div className="space-y-2">
                                {recentDocs.slice(0, 5).map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-[#1a4d4d]/8 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4.5 h-4.5 text-[#1a4d4d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-medium text-[#1e293b] truncate group-hover:text-[#1a4d4d] transition-colors">
                                                {doc.name}
                                            </p>
                                            <p className="text-sm text-gray-400">{formatSize(doc.size)} &bull; {formatTimeAgo(doc.timestamp)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                </div>
                                <p className="text-base font-medium text-gray-400">No documents yet</p>
                                <p className="text-sm text-gray-300 mt-0.5">Upload a document to see it here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column: queries + dark CTA */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Top Queries — live from chat */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-[#1e293b] mb-1">Top Queries</h3>
                        <p className="text-sm text-gray-400 mb-4">From your conversations</p>
                        {topQueries.length > 0 ? (
                            <div className="space-y-3">
                                {topQueries.map((item, i) => {
                                    const maxCount = topQueries[0].count;
                                    const barWidth = (item.count / maxCount) * 100;
                                    return (
                                        <div key={i}>
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-base text-[#1e293b] font-medium truncate pr-3">
                                                    {item.query}
                                                </p>
                                                <span className="text-base font-semibold text-[#1e293b] flex-shrink-0">
                                                    {item.count}
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#1a4d4d] to-[#2d7a6e] rounded-full"
                                                    style={{ width: `${barWidth}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-base font-medium text-gray-400">No queries yet</p>
                                <p className="text-sm text-gray-300 mt-0.5">Ask questions in Chat</p>
                            </div>
                        )}
                    </div>

                    {/* Dark teal CTA card */}
                    <div className="bg-gradient-to-br from-[#1a4d4d] to-[#0f2d2d] rounded-2xl p-6 flex flex-col justify-between text-white relative overflow-hidden">
                        {/* Decorative */}
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
                        <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-full bg-white/5" />
                        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5" />

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 flex-shrink-0 opacity-80" viewBox="0 0 32 32" fill="none">
                                    <polygon points="16,3 28,27 4,27" fill="url(#ctaPG)" opacity="0.9" />
                                    <line x1="22" y1="15" x2="30" y2="10" stroke="#6ee7b7" strokeWidth="1.2" opacity="0.8" />
                                    <line x1="23" y1="17" x2="30" y2="15" stroke="#5eead4" strokeWidth="1.2" opacity="0.7" />
                                    <defs>
                                        <linearGradient id="ctaPG" x1="4" y1="27" x2="28" y2="3">
                                            <stop offset="0%" stopColor="#6ee7b7" />
                                            <stop offset="100%" stopColor="#a5f3fc" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <span className="text-base font-semibold text-white/90">Prism</span>
                            </div>
                            <h3 className="text-2xl font-bold leading-snug mb-2">
                                Let&apos;s explore<br />your insights
                            </h3>
                            <p className="text-base text-white/60 leading-relaxed">
                                Unlock deeper analysis capabilities and discover patterns across your documents.
                            </p>
                        </div>

                        <div className="mt-5 flex items-center gap-3">
                            <button className="bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-base font-semibold px-6 py-3 rounded-xl transition-colors">
                                Deep Analysis
                            </button>
                            <button className="bg-[#2d7a6e] hover:bg-[#348a7d] text-white text-base font-semibold px-6 py-3 rounded-xl transition-colors">
                                Batch Upload
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                            <div className="flex -space-x-2">
                                {["AW", "JK", "MR"].map((initials, i) => (
                                    <div
                                        key={i}
                                        className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 border-2 border-[#1a4d4d] flex items-center justify-center text-[8px] font-bold text-white"
                                    >
                                        {initials}
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm text-white/50">250+ analysts</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
