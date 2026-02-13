import { NextRequest, NextResponse } from "next/server";

const N8N_WEBHOOK_URL =
    process.env.N8N_WEBHOOK_URL ||
    "https://trinitycore.app.n8n.cloud/webhook/upload-analyze";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Build form-data payload matching n8n webhook expectations:
        //   data: File, fileName: string, fileType: string
        const n8nForm = new FormData();
        n8nForm.append("data", file, file.name);
        n8nForm.append("fileName", file.name);
        n8nForm.append("fileType", file.type || "application/pdf");

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            body: n8nForm,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("n8n webhook error:", response.status, errorText);
            return NextResponse.json(
                { error: `n8n webhook returned ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json().catch(() => ({}));

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        console.error("n8n upload proxy error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
