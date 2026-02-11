"use client";

import React from "react";

interface QuerySectionProps {
    query: string;
    onQueryChange: (query: string) => void;
}

const MAX_CHARS = 500;

export default function QuerySection({ query, onQueryChange }: QuerySectionProps) {
    return (
        <div className="bg-card rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-ink">Your Query</h2>
                </div>

                <div className="relative">
                    <textarea
                        rows={4}
                        maxLength={MAX_CHARS}
                        placeholder="What information are you looking for in this document?"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-ink placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
                    />
                    <div className="flex justify-end mt-2">
                        <span
                            className={`text-xs font-medium transition-colors ${query.length > MAX_CHARS * 0.9
                                    ? "text-red-400"
                                    : query.length > MAX_CHARS * 0.7
                                        ? "text-amber-400"
                                        : "text-gray-300"
                                }`}
                        >
                            {query.length}/{MAX_CHARS}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
