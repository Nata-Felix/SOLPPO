import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL =
    "https://n8n.solucaoparceira.com.br/webhook/39688e6c-4ae5-4a10-aeb4-8b81cae2b1b6";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Log payload size for debugging
        const payloadStr = JSON.stringify(body);
        console.log(`[whatsapp-webhook] Sending payload to n8n. Size: ${(payloadStr.length / 1024).toFixed(1)}KB`);

        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payloadStr,
        });

        // Read response body regardless of status
        const responseText = await response.text();
        console.log(`[whatsapp-webhook] n8n response: status=${response.status}, body=${responseText.slice(0, 500)}`);

        if (response.ok) {
            return NextResponse.json({ ok: true, status: response.status });
        } else {
            return NextResponse.json(
                {
                    error: "n8n webhook error",
                    n8n_status: response.status,
                    n8n_body: responseText,
                },
                { status: 502 }
            );
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("[whatsapp-webhook] Proxy error:", msg);
        return NextResponse.json(
            { error: "Failed to reach webhook", detail: msg },
            { status: 500 }
        );
    }
}
