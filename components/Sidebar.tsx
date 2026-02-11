"use client";

import React from "react";

interface SidebarProps {
    activeItem: string;
    onNavigate: (item: string) => void;
}

export default function Sidebar({ activeItem, onNavigate }: SidebarProps) {
    const navItems = [
        {
            id: "upload",
            label: "Upload Document",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            ),
        },
        {
            id: "chat",
            label: "Chat",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
        },
        {
            id: "analytics",
            label: "Analytics",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
            ),
        },
        {
            id: "settings",
            label: "Settings",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
    ];

    return (
        <aside className="w-[260px] min-w-[260px] bg-transparent flex flex-col min-h-full">
            {/* Logo */}
            <div className="px-6 pt-7 pb-5">
                <div className="flex items-center gap-3">
                    {/* Prism Logo — a cute triangular prism with light refraction */}
                    <svg className="w-9 h-9 flex-shrink-0" viewBox="0 0 32 32" fill="none">
                        {/* Prism triangle */}
                        <polygon points="16,3 28,27 4,27" fill="url(#prismGrad)" opacity="0.9" />
                        {/* Light beam entering */}
                        <line x1="2" y1="14" x2="12" y2="17" stroke="white" strokeWidth="1.5" opacity="0.7" />
                        {/* Rainbow refraction lines */}
                        <line x1="22" y1="15" x2="30" y2="10" stroke="#6ee7b7" strokeWidth="1.2" opacity="0.8" />
                        <line x1="23" y1="17" x2="30" y2="15" stroke="#5eead4" strokeWidth="1.2" opacity="0.7" />
                        <line x1="23" y1="19" x2="30" y2="20" stroke="#a5f3fc" strokeWidth="1.2" opacity="0.6" />
                        {/* Inner highlight */}
                        <polygon points="16,8 23,24 9,24" fill="white" opacity="0.08" />
                        <defs>
                            <linearGradient id="prismGrad" x1="4" y1="27" x2="28" y2="3">
                                <stop offset="0%" stopColor="#6ee7b7" />
                                <stop offset="50%" stopColor="#5eead4" />
                                <stop offset="100%" stopColor="#a5f3fc" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="text-white font-bold text-[24px]" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>Prism</span>
                </div>
            </div>

            {/* Navigation Label */}
            <div className="px-6 pt-2 pb-2">
                <p className="text-xs font-medium text-white/40 uppercase tracking-[0.15em]">
                    Navigation
                </p>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 space-y-1.5">
                {navItems.map((item) => {
                    const isActive = activeItem === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-150 ${isActive
                                ? "bg-white/15 text-white"
                                : "text-white/70 hover:bg-white/8 hover:text-white"
                                }`}
                        >
                            <span className={isActive ? "text-white" : "text-white/55"}>{item.icon}</span>
                            {item.label}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
