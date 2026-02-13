import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

// Google Drive folder "Automate2026" — knowledge base for RAG
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "16b4BM1C0zxnmyQ98WumWMJMO5PVT6ypO";
const N8N_UPLOAD_WEBHOOK_URL =
    process.env.N8N_UPLOAD_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_WEBHOOK_URL ||
    "";

function getAuth() {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!raw) {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY env variable is missing");
    }
    const credentials = JSON.parse(raw);
    return new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
}

async function uploadToDrive(
    name: string,
    mimeType: string,
    body: Readable
) {
    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.create({
        supportsAllDrives: true,
        requestBody: {
            name,
            parents: [FOLDER_ID],
        },
        media: { mimeType, body },
        fields: "id, name, webViewLink",
    });

    return response.data;
}

function isServiceAccountQuotaError(message: string) {
    return (
        message.includes("Service Accounts do not have storage quota") ||
        message.includes("storage quota")
    );
}

async function uploadViaN8nWebhook(
    fileName: string,
    fileType: string,
    content: Buffer
) {
    if (!N8N_UPLOAD_WEBHOOK_URL) {
        throw new Error("N8N_UPLOAD_WEBHOOK_URL is not configured");
    }

    const form = new FormData();
    form.append("data", new Blob([content], { type: fileType }), fileName);
    form.append("fileName", fileName);
    form.append("fileType", fileType);

    const res = await fetch(N8N_UPLOAD_WEBHOOK_URL, {
        method: "POST",
        body: form,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`n8n upload failed (${res.status}): ${text}`);
    }

    const data = await res.json().catch(() => ({}));
    return {
        success: true,
        fallback: "n8n-webhook",
        data,
    };
}

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") || "";

        // ── Handle JSON body (pasted text) ──────────────────
        if (contentType.includes("application/json")) {
            const { text, fileName } = await req.json();
            if (!text || typeof text !== "string" || !text.trim()) {
                return NextResponse.json(
                    { error: "No text provided" },
                    { status: 400 }
                );
            }

            const safeName =
                (fileName || `pasted-text-${Date.now()}`).replace(
                    /[^a-zA-Z0-9._-]/g,
                    "_"
                ) + ".txt";

            const buffer = Buffer.from(text, "utf-8");
            let data;
            try {
                const stream = Readable.from(buffer);
                data = await uploadToDrive(safeName, "text/plain", stream);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Upload failed";
                if (isServiceAccountQuotaError(message)) {
                    const fallback = await uploadViaN8nWebhook(
                        safeName,
                        "text/plain",
                        buffer
                    );
                    return NextResponse.json(fallback);
                }
                throw error;
            }

            return NextResponse.json({
                success: true,
                fileId: data.id,
                fileName: data.name,
                webViewLink: data.webViewLink,
            });
        }

        // ── Handle form-data body (file upload) ─────────────
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let data;
        try {
            const stream = Readable.from(buffer);
            data = await uploadToDrive(
                file.name,
                file.type || "application/pdf",
                stream
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : "Upload failed";
            if (isServiceAccountQuotaError(message)) {
                const fallback = await uploadViaN8nWebhook(
                    file.name,
                    file.type || "application/pdf",
                    buffer
                );
                return NextResponse.json(fallback);
            }
            throw error;
        }

        return NextResponse.json({
            success: true,
            fileId: data.id,
            fileName: data.name,
            webViewLink: data.webViewLink,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        const quotaHelp = isServiceAccountQuotaError(message)
            ? " Service accounts cannot upload to My Drive directly. Use a Shared Drive folder or configure N8N_UPLOAD_WEBHOOK_URL to upload via your n8n Google Drive credentials."
            : "";
        console.error("Google Drive upload error:", message);
        return NextResponse.json({ error: `${message}${quotaHelp}` }, { status: 500 });
    }
}
