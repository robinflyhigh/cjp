import { promises as fs } from "fs";
import path from "path";
import {
  MIME_TYPES,
  VIDEO_EXTENSIONS,
  type VideoItem,
} from "@/types/video";
import { naturalCompare } from "@/lib/naturalSort";

export function getDownloadsDir(): string {
  return path.join(process.cwd(), "downloads");
}

export function isSupportedVideo(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return VIDEO_EXTENSIONS.includes(ext as (typeof VIDEO_EXTENSIONS)[number]);
}

export function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return MIME_TYPES[ext] ?? "application/octet-stream";
}

export function titleFromFilename(filename: string): string {
  return path.parse(filename).name;
}

export function resolveSafeVideoPath(filename: string): string | null {
  if (!filename || filename.includes("\0")) return null;

  const downloadsDir = getDownloadsDir();
  const decoded = decodeURIComponent(filename);
  const basename = path.basename(decoded);

  if (basename !== decoded.replace(/\\/g, "/").split("/").pop()) {
    return null;
  }

  if (!isSupportedVideo(basename)) return null;

  const fullPath = path.join(downloadsDir, basename);
  const resolved = path.resolve(fullPath);
  const resolvedDir = path.resolve(downloadsDir);
  const normalizedResolved = resolved.toLowerCase();
  const normalizedDir = resolvedDir.toLowerCase();

  if (
    normalizedResolved !== normalizedDir &&
    !normalizedResolved.startsWith(normalizedDir + path.sep.toLowerCase())
  ) {
    return null;
  }

  return resolved;
}

export async function scanVideos(): Promise<VideoItem[]> {
  const downloadsDir = getDownloadsDir();

  try {
    await fs.access(downloadsDir);
  } catch {
    return [];
  }

  const entries = await fs.readdir(downloadsDir, { withFileTypes: true });
  const videos: VideoItem[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!isSupportedVideo(entry.name)) continue;

    const fullPath = path.join(downloadsDir, entry.name);

    try {
      const stats = await fs.stat(fullPath);
      videos.push({
        title: titleFromFilename(entry.name),
        filename: entry.name,
        url: `/api/video/${encodeURIComponent(entry.name)}`,
        size: stats.size,
        modified: stats.mtime.toISOString(),
      });
    } catch {
      // Skip unreadable files
    }
  }

  videos.sort((a, b) => naturalCompare(a.filename, b.filename));
  return videos;
}
