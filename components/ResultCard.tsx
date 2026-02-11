"use client";

import React, { useState } from "react";
import { AnalysisResult } from "@/lib/types";
import ConfidenceScore from "./ConfidenceScore";

interface ResultCardProps {
    result: AnalysisResult;
    index: number;
}

export default function ResultCard({ result, index }: ResultCardProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className="bg-card rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            style={{ animationDelay: `${index * 150}ms` }}
        >
            <div className="p-6">
                <div className="flex items-start gap-5">
                    {/* Confidence Score */}
                    <div className="flex-shrink-0">
                        <ConfidenceScore score={result.confidence_score} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Page Badge & Index */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Page {result.page_number}
                            </span>
                            <span className="text-[10px] text-gray-300 font-medium">
                                Result #{index + 1}
                            </span>
                        </div>

                        {/* Extracted Text */}
                        <blockquote className="relative bg-gray-50 border-l-3 border-l-primary/40 rounded-r-lg px-4 py-3 mb-3">
                            <svg className="absolute top-2 right-3 w-5 h-5 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z" />
                            </svg>
                            <p className="text-sm text-ink/80 leading-relaxed italic">
                                &ldquo;{result.extracted_text}&rdquo;
                            </p>
                        </blockquote>

                        {/* Explanation */}
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Relevance
                            </p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {result.explanation_of_relevance}
                            </p>
                        </div>

                        {/* Audit Reasoning (Expandable) */}
                        <div className="border-t border-gray-100 pt-3">
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-600 transition-colors group"
                            >
                                <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""
                                        }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                                <span className="group-hover:underline">
                                    {expanded ? "Hide" : "Show"} Audit Reasoning
                                </span>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ${expanded ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
                                    }`}
                            >
                                <div className="bg-primary-50/30 border border-primary/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                        <span className="text-xs font-semibold text-primary">
                                            Audit Trail
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {result.audit_reasoning}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
