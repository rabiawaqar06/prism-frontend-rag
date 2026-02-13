import { NextRequest, NextResponse } from "next/server";

// n8n "When chat message received" webhook
const N8N_CHAT_URL =
    process.env.N8N_CHAT_WEBHOOK_URL ||
    "https://trinitycore.app.n8n.cloud/webhook/upload-analyze";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, fileName, sessionId } = body;

        if (!query) {
            return NextResponse.json(
                { error: "No query provided" },
                { status: 400 }
            );
        }

        // Send the chat message to n8n AI Agent workflow
        const response = await fetch(N8N_CHAT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chatInput: query,
                sessionId: sessionId || `session-${Date.now()}`,
                action: "sendMessage",
                fileName: fileName || "",
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("n8n chat error:", response.status, errorText);
            return NextResponse.json(
                { error: `n8n returned ${response.status}` },
                { status: response.status }
            );
        }

        // n8n may return JSON or plain text
        const rawText = await response.text();
        let data;
        try {
            data = JSON.parse(rawText);
        } catch {
            data = { output: rawText };
        }

        return NextResponse.json({ success: true, data });
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Chat request failed";
        console.error("n8n chat proxy error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
