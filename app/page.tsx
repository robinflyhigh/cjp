import { VideoPlayer } from "@/components/VideoPlayer";
import { scanVideos } from "@/lib/videos";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const videos = await scanVideos();

  return <VideoPlayer videos={videos} />;
}
