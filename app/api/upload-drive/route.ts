import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

const FOLDER_ID = "16b4BM1C0zxnmyQ98WumWMJMO5PVT6ypO";

function getAuth() {
    // Expect a service-account JSON key stored as a single env var
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

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const auth = getAuth();
        const drive = google.drive({ version: "v3", auth });

        // Convert the Web API File into a Node Readable stream
        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(buffer);

        const response = await drive.files.create({
            requestBody: {
                name: file.name,
                parents: [FOLDER_ID],
            },
            media: {
                mimeType: file.type || "application/pdf",
                body: stream,
            },
            fields: "id, name, webViewLink",
        });

        return NextResponse.json({
            success: true,
            fileId: response.data.id,
            fileName: response.data.name,
            webViewLink: response.data.webViewLink,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        console.error("Google Drive upload error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
