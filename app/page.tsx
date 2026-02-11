"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import UploadSection from "@/components/UploadSection";
import ChatSection from "@/components/ChatSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import { WEBHOOK_URL } from "@/lib/mock-data";

export default function Home() {
    const [activeNav, setActiveNav] = useState("upload");
    const [fileUrl, setFileUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleNewAnalysis = () => {
        setFileUrl("");
        setSelectedFile(null);
    };

    // Tab titles per section
    const tabTitles: Record<string, { title: string; subtitle: string }> = {
        upload: { title: "Document Analysis", subtitle: "Upload a document and ask questions about its content" },
        analytics: { title: "Analytics", subtitle: "Overview of your document analysis activity and insights" },
        chat: { title: "Chat", subtitle: "Ask questions about your uploaded documents" },
        settings: { title: "Settings", subtitle: "Configure your preferences and API connections" },
    };

    const currentTab = tabTitles[activeNav] || tabTitles.upload;

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-[#1a4d4d] via-[#1e5252] to-[#173f3f] flex overflow-hidden">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-40 transition-transform duration-300 lg:static lg:translate-x-0
                ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <Sidebar
                    activeItem={activeNav}
                    onNavigate={(item) => { setActiveNav(item); setMobileOpen(false); }}
                />
            </div>

            {/* White inner card */}
            <main className="flex-1 flex flex-col min-w-0 bg-white rounded-[16px] my-2.5 mr-2.5 shadow-sm overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-100/80 flex-shrink-0 rounded-t-[16px]">
                    <div className="flex items-center justify-between px-6 lg:px-8 py-4">
                        <div className="flex items-center gap-3">
                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="lg:hidden text-gray-500 hover:text-[#1a4d4d] transition-colors p-1"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-[#1e293b]">{currentTab.title}</h1>
                                <p className="text-base text-gray-400 mt-1">
                                    {currentTab.subtitle}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Action Button */}
                            {activeNav === "upload" && (
                                <button
                                    onClick={handleNewAnalysis}
                                    className="flex items-center gap-2 bg-gradient-to-r from-[#1a4d4d] to-[#2d7a6e] hover:from-[#163f3f] hover:to-[#256b60] text-white px-6 py-3 rounded-xl text-base font-semibold transition-all duration-150 active:scale-95 shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Analysis
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto bg-[#f8f9fb] rounded-b-[16px]">
                    {activeNav === "upload" && (
                        <div className="py-4">
                            <UploadSection
                                fileUrl={fileUrl}
                                onFileUrlChange={setFileUrl}
                                onFileSelect={setSelectedFile}
                                selectedFile={selectedFile}
                            />
                        </div>
                    )}

                    {activeNav === "chat" && <ChatSection uploadedFileName={selectedFile?.name || null} />}

                    {activeNav === "analytics" && <AnalyticsSection />}

                    {activeNav === "settings" && (
                        <div className="px-8 py-6 max-w-4xl space-y-5">
                            {/* API Config */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-[#1e293b] mb-2">API Configuration</h3>
                                <p className="text-base text-gray-400 mb-5">
                                    Configure the backend webhook URL for document analysis.
                                </p>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    </div>
                                    <input
                                        type="url"
                                        defaultValue={WEBHOOK_URL}
                                        placeholder="https://your-api-endpoint.com/analyze"
                                        className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-base text-[#1e293b] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a4d4d]/15 focus:border-[#1a4d4d]/40 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Preferences */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Preferences</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-base font-medium text-[#1e293b]">Theme</p>
                                            <p className="text-sm text-gray-400">Light mode is currently active</p>
                                        </div>
                                        <span className="text-sm text-gray-400 bg-gray-50 px-4 py-2 rounded-lg">Light</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
