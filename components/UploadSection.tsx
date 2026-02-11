"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addDocument } from "@/lib/feedbackStore";

/* ── Types ─────────────────────────────────────────────────── */

interface UploadSectionProps {
    fileUrl: string;
    onFileUrlChange: (url: string) => void;
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
}

type StepStatus = "waiting" | "in-progress" | "completed";

interface PipelineStep {
    label: string;
    icon: React.ReactNode;
    status: StepStatus;
    time?: string;
}

interface AgentLine {
    id: number;
    text: string;
}

/* ── Dummy data ────────────────────────────────────────────── */

const GRAPH_NODES = [
    { id: "doc", label: "Q3 Financial Report", x: 50, y: 50, size: 28, color: "#1a4d4d" },
    { id: "n1", label: "Financial Metrics", x: 18, y: 22, size: 20, color: "#0d9488" },
    { id: "n2", label: "Q4 Revenue", x: 82, y: 20, size: 18, color: "#10b981" },
    { id: "n3", label: "Risk Factors", x: 15, y: 78, size: 16, color: "#f59e0b" },
    { id: "n4", label: "Projections", x: 80, y: 75, size: 17, color: "#0d9488" },
    { id: "n5", label: "APAC Growth", x: 50, y: 88, size: 14, color: "#10b981" },
    { id: "n6", label: "Compliance", x: 88, y: 50, size: 15, color: "#f59e0b" },
];

const GRAPH_EDGES = [
    ["doc", "n1"], ["doc", "n2"], ["doc", "n3"], ["doc", "n4"], ["doc", "n5"], ["doc", "n6"],
    ["n1", "n2"], ["n3", "n4"], ["n2", "n4"],
];

const AGENT_FEED: AgentLine[] = [
    { id: 1, text: "🤖 Agent 1 (The Analyst — Llama 3)" },
    { id: 2, text: "   └─ Analyzing chunk 24/87..." },
    { id: 3, text: "   └─ Confidence: 78%" },
    { id: 4, text: "🔍 Agent 2 (The Auditor — Gemini 2.5 Flash)" },
    { id: 5, text: "   └─ Verifying citations..." },
    { id: 6, text: "   └─ Cross-referencing page 12" },
    { id: 7, text: "🤖 Agent 1 — Chunk 25/87 analyzed, confidence: 82%" },
    { id: 8, text: "🔍 Agent 2 — Citation verified ✓ (page 12, ¶3)" },
    { id: 9, text: "🤖 Agent 1 — Key entity found: \"$4.5M Q4 Revenue\"" },
    { id: 10, text: "🔍 Agent 2 — Cross-referencing with page 27..." },
    { id: 11, text: "🤖 Agent 1 — Chunk 45/87 analyzed, confidence: 91%" },
    { id: 12, text: "🔍 Agent 2 — All citations verified ✓" },
];

/* ── Subcomponents ─────────────────────────────────────────── */

function PipelineStepper({ steps }: { steps: PipelineStep[] }) {
    return (
        <div className="space-y-0">
            {steps.map((step, i) => {
                const isLast = i === steps.length - 1;
                return (
                    <div key={i} className="flex gap-3">
                        {/* Vertical line + icon */}
                        <div className="flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-colors duration-300 ${step.status === "completed"
                                    ? "bg-[#10b981] text-white"
                                    : step.status === "in-progress"
                                        ? "bg-[#1a4d4d] text-white ring-4 ring-[#1a4d4d]/20"
                                        : "bg-gray-100 text-gray-400"
                                    }`}
                            >
                                {step.status === "completed" ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : step.status === "in-progress" ? (
                                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                                ) : (
                                    <span className="text-xs">{step.icon}</span>
                                )}
                            </motion.div>
                            {!isLast && (
                                <div className={`w-0.5 h-6 transition-colors duration-300 ${step.status === "completed" ? "bg-[#10b981]" : "bg-gray-200"
                                    }`} />
                            )}
                        </div>
                        {/* Label + time */}
                        <div className="pt-1 pb-3">
                            <p className={`text-base font-medium ${step.status === "completed"
                                ? "text-[#1e293b]"
                                : step.status === "in-progress"
                                    ? "text-[#1a4d4d] font-semibold"
                                    : "text-gray-400"
                                }`}>
                                {step.label}
                                {step.status === "in-progress" && (
                                    <span className="inline-block ml-2 text-sm text-[#0d9488] animate-pulse">Processing...</span>
                                )}
                            </p>
                            {step.time && (
                                <p className="text-sm text-gray-400 mt-0.5">{step.time}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function AgentFeed({ lines }: { lines: AgentLine[] }) {
    return (
        <div className="font-mono text-sm leading-relaxed space-y-1.5 max-h-[240px] overflow-y-auto">
            {lines.map((line, i) => (
                <motion.div
                    key={line.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.3 }}
                    className={`${line.text.startsWith("🤖") ? "text-[#1a4d4d]" : line.text.startsWith("🔍") ? "text-[#0d9488]" : "text-gray-500"}`}
                >
                    {line.text}
                </motion.div>
            ))}
        </div>
    );
}

function KnowledgeGraph() {
    return (
        <div className="relative w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                {/* Edges */}
                {GRAPH_EDGES.map(([from, to], i) => {
                    const a = GRAPH_NODES.find(n => n.id === from)!;
                    const b = GRAPH_NODES.find(n => n.id === to)!;
                    return (
                        <motion.line
                            key={i}
                            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                            stroke="#e2e8f0" strokeWidth="0.4"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.6 }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                        />
                    );
                })}
                {/* Nodes */}
                {GRAPH_NODES.map((node, i) => (
                    <g key={node.id}>
                        <motion.circle
                            cx={node.x} cy={node.y} r={node.size / 6}
                            fill={node.color}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [1, 1.08, 1], opacity: 0.85 }}
                            transition={{
                                delay: 0.5 + i * 0.12,
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse",
                            }}
                        />
                        <motion.text
                            x={node.x}
                            y={node.y + node.size / 6 + 4}
                            textAnchor="middle"
                            className="fill-gray-600"
                            fontSize="4"
                            fontWeight={node.id === "doc" ? "700" : "500"}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 + i * 0.12 }}
                        >
                            {node.label}
                        </motion.text>
                    </g>
                ))}
            </svg>
        </div>
    );
}

/* ── Main Component ────────────────────────────────────────── */

export default function UploadSection({
    fileUrl,
    onFileUrlChange,
    onFileSelect,
    selectedFile,
}: UploadSectionProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingDone, setProcessingDone] = useState(false);
    const [pipelineStep, setPipelineStep] = useState(0);
    const [agentLines, setAgentLines] = useState<AgentLine[]>([]);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const fileInputRef = useRef<HTMLInputElement>(null);

    /** Upload file to Google Drive via our API route */
    const uploadToDrive = async (file: File) => {
        setUploadStatus("uploading");
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload-drive", { method: "POST", body: formData });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || `Upload failed (${res.status})`);
            }
            setUploadStatus("success");
        } catch (err) {
            console.error("Drive upload error:", err);
            setUploadStatus("error");
            setError(err instanceof Error ? err.message : "Failed to upload to Google Drive");
        }
    };

    const validateFile = (file: File): boolean => {
        if (file.type !== "application/pdf") { setError("Only PDF files are supported."); return false; }
        setError(null);
        return true;
    };

    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0 && validateFile(files[0])) { onFileSelect(files[0]); onFileUrlChange(""); }
    }, [onFileSelect, onFileUrlChange]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0 && validateFile(files[0])) { onFileSelect(files[0]); onFileUrlChange(""); }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    /* ── Mock Processing Simulation ──── */
    const startProcessing = () => {
        setIsProcessing(true);
        setProcessingDone(false);
        setPipelineStep(0);
        setAgentLines([]);

        const stepTimes = [800, 1200, 1000, 900, 800, 1300];
        let elapsed = 0;

        stepTimes.forEach((dur, i) => {
            elapsed += dur;
            setTimeout(() => setPipelineStep(i + 1), elapsed);
        });

        // Agent feed lines appear over time
        AGENT_FEED.forEach((line, i) => {
            setTimeout(() => {
                setAgentLines(prev => [...prev, line]);
            }, 600 + i * 400);
        });

        setTimeout(() => {
            setIsProcessing(false);
            setProcessingDone(true);
        }, elapsed + 500);
    };

    useEffect(() => {
        if (selectedFile && !isProcessing && !processingDone) {
            // Record doc immediately so it shows in Analytics
            addDocument(selectedFile.name, selectedFile.size);
            // Upload to Google Drive in parallel with processing visualization
            uploadToDrive(selectedFile);
            const t = setTimeout(startProcessing, 600);
            return () => clearTimeout(t);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFile]);

    /* ── Pipeline steps derived from state ──── */
    const STEP_LABELS = [
        "Document Upload",
        "Text Extraction",
        "Document Chunking",
        "Embedding Generation",
        "Vector Storage",
        "AI Analysis",
    ];

    const STEP_ICONS: React.ReactNode[] = [
        <svg key="s1" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
        <svg key="s2" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        <svg key="s3" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>,
        <svg key="s4" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
        <svg key="s5" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>,
        <svg key="s6" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    ];

    const pipelineSteps: PipelineStep[] = STEP_LABELS.map((label, i) => ({
        label,
        icon: STEP_ICONS[i],
        status: i < pipelineStep ? "completed" as StepStatus : i === pipelineStep && isProcessing ? "in-progress" as StepStatus : "waiting" as StepStatus,
        time: i < pipelineStep ? `${(0.6 + Math.random() * 2).toFixed(1)}s` : undefined,
    }));


    /* ── Render ─────────────────────────────────────────────── */
    return (
        <div className="space-y-6 px-6 lg:px-8">
            {/* ── Upload Card ──────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
                <div className="p-7">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-lg bg-[#1a4d4d]/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-[#1a4d4d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-[#1e293b]">Upload Document</h2>
                    </div>

                    {/* Dropzone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragging
                            ? "dropzone-active border-[#0d9488] bg-[#0d9488]/5 scale-[1.01]"
                            : selectedFile
                                ? "border-[#10b981]/40 bg-[#10b981]/5"
                                : "border-gray-200 hover:border-[#1a4d4d]/40 hover:bg-gray-50/50"
                            }`}
                    >
                        <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleFileInput} className="hidden" />

                        {selectedFile ? (
                            <div className="flex flex-col items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="w-20 h-20 rounded-2xl bg-[#10b981]/10 flex items-center justify-center"
                                >
                                    <svg className="w-10 h-10 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </motion.div>
                                <div>
                                    <p className="text-lg font-semibold text-[#1e293b]">{selectedFile.name}</p>
                                    <p className="text-base text-gray-400 mt-1">{formatFileSize(selectedFile.size)} • PDF Document</p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onFileSelect(null as unknown as File); setProcessingDone(false); setIsProcessing(false); setPipelineStep(0); setAgentLines([]); setUploadStatus("idle"); }}
                                    className="text-base text-red-400 hover:text-red-600 font-medium transition-colors"
                                >
                                    Remove file
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-[#1e293b]">{isDragging ? "Drop your PDF here" : "Upload Document or Paste Text"}</p>
                                    <p className="text-base text-gray-400 mt-1">Drag & drop or click to browse</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Google Drive upload status */}
                    {uploadStatus !== "idle" && (
                        <div className={`mt-4 flex items-center gap-2 text-base px-5 py-3 rounded-lg ${uploadStatus === "uploading" ? "text-[#0d9488] bg-[#0d9488]/10" :
                            uploadStatus === "success" ? "text-[#10b981] bg-[#10b981]/10" :
                                "text-red-500 bg-red-50"
                            }`}>
                            {uploadStatus === "uploading" && (
                                <><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Uploading to Google Drive...</>
                            )}
                            {uploadStatus === "success" && (
                                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Uploaded to Google Drive successfully</>
                            )}
                            {uploadStatus === "error" && (
                                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Google Drive upload failed</>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-red-500 text-base bg-red-50 px-5 py-3 rounded-lg">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Paste text fallback */}
                    {!selectedFile && (
                        <>
                            <div className="flex items-center gap-4 my-5">
                                <div className="flex-1 h-px bg-gray-100" />
                                <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">..or paste text</span>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-4 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <textarea
                                    placeholder="Paste your document text here..."
                                    value={fileUrl}
                                    onChange={(e) => { onFileUrlChange(e.target.value); setError(null); }}
                                    rows={4}
                                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-base text-[#1e293b] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a4d4d]/20 focus:border-[#1a4d4d] transition-all resize-none leading-relaxed"
                                />
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            {/* ── Processing Pipeline ────────────── */}
            <AnimatePresence>
                {(isProcessing || processingDone) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
                    >
                        {/* Pipeline Stepper */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
                            <h3 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#0d9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Processing Pipeline
                                {isProcessing && <span className="text-xs text-[#0d9488] animate-pulse font-normal ml-1">Live</span>}
                            </h3>
                            <PipelineStepper steps={pipelineSteps} />
                            {processingDone && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-4 flex items-center gap-2 text-base text-[#10b981] bg-[#10b981]/10 px-5 py-3 rounded-lg font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    All steps completed in 3.2s
                                </motion.div>
                            )}
                        </div>

                        {/* Multi-Agent Activity Feed */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
                            <h3 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
                                Agent Activity
                                <span className="text-sm font-normal text-gray-400 ml-auto">Real-time</span>
                            </h3>
                            <div className="bg-[#f8f9fb] rounded-xl p-4 border border-gray-50">
                                <AgentFeed lines={agentLines} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Knowledge Graph (full width) ──── */}
            <AnimatePresence>
                {processingDone && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                    >
                        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
                            <h3 className="text-lg font-semibold text-[#1e293b] mb-2">
                                🧠 Knowledge Graph
                            </h3>
                            <p className="text-base text-gray-400 mb-4">Key concepts and relationships extracted from the document</p>
                            <div className="h-[340px]">
                                <KnowledgeGraph />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
