import { createReadStream, promises as fs } from "fs";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import { getMimeType, resolveSafeVideoPath } from "@/lib/videos";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { filename: rawFilename } = await context.params;
  const filename = decodeURIComponent(rawFilename);
  const filePath = resolveSafeVideoPath(filename);

  if (!filePath) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  let stats;
  try {
    stats = await fs.stat(filePath);
  } catch {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  if (!stats.isFile()) {
    return NextResponse.json({ error: "Not a file" }, { status: 404 });
  }

  const fileSize = stats.size;
  const mimeType = getMimeType(filename);
  const rangeHeader = request.headers.get("range");

  const commonHeaders: Record<string, string> = {
    "Accept-Ranges": "bytes",
    "Content-Type": mimeType,
    "Cache-Control": "private, no-cache",
    "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
  };

  if (rangeHeader) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
    if (!match) {
      return new NextResponse("Invalid Range", {
        status: 416,
        headers: {
          "Content-Range": `bytes */${fileSize}`,
        },
      });
    }

    const startStr = match[1];
    const endStr = match[2];

    let start = startStr ? parseInt(startStr, 10) : NaN;
    let end = endStr ? parseInt(endStr, 10) : NaN;

    if (Number.isNaN(start) && Number.isNaN(end)) {
      return new NextResponse("Invalid Range", {
        status: 416,
        headers: {
          "Content-Range": `bytes */${fileSize}`,
        },
      });
    }

    if (Number.isNaN(start)) {
      const suffixLength = end;
      start = Math.max(fileSize - suffixLength, 0);
      end = fileSize - 1;
    } else if (Number.isNaN(end)) {
      end = fileSize - 1;
    }

    if (start >= fileSize || end >= fileSize || start > end || start < 0) {
      return new NextResponse("Range Not Satisfiable", {
        status: 416,
        headers: {
          "Content-Range": `bytes */${fileSize}`,
        },
      });
    }

    const chunkSize = end - start + 1;
    const nodeStream = createReadStream(filePath, {
      start,
      end,
      highWaterMark: 64 * 1024,
    });
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        ...commonHeaders,
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Length": String(chunkSize),
      },
    });
  }

  const nodeStream = createReadStream(filePath, {
    highWaterMark: 64 * 1024,
  });
  const webStream = Readable.toWeb(nodeStream) as ReadableStream;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      ...commonHeaders,
      "Content-Length": String(fileSize),
    },
  });
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  const { filename: rawFilename } = await context.params;
  const filename = decodeURIComponent(rawFilename);
  const filePath = resolveSafeVideoPath(filename);

  if (!filePath) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  let stats;
  try {
    stats = await fs.stat(filePath);
  } catch {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Accept-Ranges": "bytes",
      "Content-Type": getMimeType(filename),
      "Content-Length": String(stats.size),
      "Cache-Control": "private, no-cache",
    },
  });
}
