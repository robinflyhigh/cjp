import { NextResponse } from "next/server";
import { scanVideos } from "@/lib/videos";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const videos = await scanVideos();
    return NextResponse.json(videos, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to scan videos:", error);
    return NextResponse.json(
      { error: "Failed to scan downloads directory" },
      { status: 500 }
    );
  }
}
