import { redis } from '@/lib/redis';

// SANGAT PENTING 1: Mencegah Next.js melakukan cache pada stream video
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing Video ID', { status: 400 });
  }

  try {
    // 1. Ambil URL dari Redis
    let videoUrl = await redis.get(id);

    if (!videoUrl) {
      return new Response('Video not found in Database', { status: 404 });
    }

    // SANGAT PENTING 2: Bersihkan string URL. Kutip/spasi nyasar bikin fetch() crash!
    videoUrl = videoUrl.replace(/['"]/g, '').trim();
    if (!videoUrl.startsWith('http')) {
      videoUrl = `https://${videoUrl}`;
    }

    // 2. Siapkan Headers untuk bypass proteksi Videy
    const fetchHeaders = new Headers();
    
    // Teruskan 'Range' dari browser untuk fitur seek (dipercepat/mundur)
    const range = request.headers.get('range');
    if (range) fetchHeaders.set('Range', range);

    // Menyamar secara identik sebagai browser
    fetchHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    fetchHeaders.set('Referer', 'https://videy.co/');
    fetchHeaders.set('Accept', '*/*');

    // 3. Fetch ke server Videy (tanpa cache)
    const response = await fetch(videoUrl, {
      method: 'GET',
      headers: fetchHeaders,
      cache: 'no-store',
    });

    // Jika Videy menolak, tampilkan error yang jelas, bukan 500
    if (!response.ok && response.status !== 206) {
      console.error(`Upstream Error dari Videy: ${response.status}`);
      return new Response(`Error from CDN: ${response.status}`, { status: response.status });
    }

    // 4. Salin header penting ke Browser kamu
    const responseHeaders = new Headers();
    const headersToKeep = ['content-type', 'content-length', 'content-range', 'accept-ranges'];
    
    for (const header of headersToKeep) {
      if (response.headers.has(header)) {
        responseHeaders.set(header, response.headers.get(header));
      }
    }
    // Izinkan player membaca file
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    // SANGAT PENTING 3: Stream video menggunakan native Web Response
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Fatal Proxy Error:', error);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}