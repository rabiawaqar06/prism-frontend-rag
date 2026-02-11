"use client";

import React from "react";
import { AnalysisResult } from "@/lib/types";
import ResultCard from "./ResultCard";
import SkeletonLoader from "./SkeletonLoader";

interface ResultsSectionProps {
    results: AnalysisResult[];
    isLoading: boolean;
    error: string | null;
}

export default function ResultsSection({
    results,
    isLoading,
    error,
}: ResultsSectionProps) {
    if (isLoading) {
        return (
            <div className="mt-8">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full spinner" />
                    <h2 className="text-lg font-semibold text-ink">
                        Analyzing Document...
                    </h2>
                </div>
                <SkeletonLoader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-8">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-red-700 mb-1">
                        Analysis Failed
                    </h3>
                    <p className="text-sm text-red-500">{error}</p>
                    <p className="text-xs text-red-400 mt-2">
                        Please check your document and try again.
                    </p>
                </div>
            </div>
        );
    }

    if (results.length === 0) return null;

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-ink">Analysis Results</h2>
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {results.length} result{results.length !== 1 ? "s" : ""} found
                </span>
            </div>

            <div className="space-y-4">
                {results.map((result, index) => (
                    <ResultCard key={index} result={result} index={index} />
                ))}
            </div>
        </div>
    );
}
