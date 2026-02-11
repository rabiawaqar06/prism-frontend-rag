"use client";

import React from "react";

interface ConfidenceScoreProps {
    score: number;
    size?: number;
}

export default function ConfidenceScore({ score, size = 64 }: ConfidenceScoreProps) {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number): string => {
        if (s >= 90) return "#10b981"; // green
        if (s >= 70) return "#f59e0b"; // amber
        return "#f97316"; // orange
    };

    const getBgColor = (s: number): string => {
        if (s >= 90) return "#d1fae5";
        if (s >= 70) return "#fef3c7";
        return "#ffedd5";
    };

    const getLabel = (s: number): string => {
        if (s >= 90) return "High";
        if (s >= 70) return "Medium";
        return "Low";
    };

    const color = getColor(score);
    const bgColor = getBgColor(score);

    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={bgColor}
                        strokeWidth={5}
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={5}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold" style={{ color }}>
                        {score}%
                    </span>
                </div>
            </div>
            <span
                className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ color, backgroundColor: bgColor }}
            >
                {getLabel(score)}
            </span>
        </div>
    );
}
