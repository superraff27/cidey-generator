import { redis } from '@/lib/redis';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  return {
    title: `Watch Video - Cidey (${resolvedParams.id})`,
  };
}

export default async function VideoPlayerPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const videoUrl = await redis.get(id);

  if (!videoUrl) {
    notFound();
  }

  const proxyVideoUrl = `/api/proxy-video?id=${id}`;

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
        <video
          controls
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        >
          <source src={proxyVideoUrl} type="video/mp4" />
          Browser kamu tidak mendukung pemutaran video ini.
        </video>
      </div>
    </main>
  );
}