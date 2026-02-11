"use client";

import React from "react";

export default function SkeletonLoader() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="bg-card rounded-2xl border border-gray-100 p-6 space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full skeleton" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-24 rounded-lg skeleton" />
                            <div className="h-3 w-32 rounded-lg skeleton" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 w-full rounded-lg skeleton" />
                        <div className="h-3 w-5/6 rounded-lg skeleton" />
                        <div className="h-3 w-4/6 rounded-lg skeleton" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-6 w-20 rounded-full skeleton" />
                        <div className="h-6 w-28 rounded-full skeleton" />
                    </div>
                </div>
            ))}
        </div>
    );
}
