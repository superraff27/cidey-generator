import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { nanoid } from 'nanoid';

export async function POST(request) {
  try {
    const { videoUrl, redirectUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: 'URL video wajib diisi' }, { status: 400 });
    }

    // Generate ID unik 6 karakter
    const id = nanoid(6);

    // Default fallback redirect jika tidak diisi oleh user
    const defaultRedirect = 'https://s.shopee.co.id/903zrG9yQZ';

    // Simpan objek data berisi videoUrl dan redirectUrl ke Redis
    const dataToStore = {
      videoUrl: videoUrl.trim(),
      redirectUrl: redirectUrl && redirectUrl.trim() ? redirectUrl.trim() : defaultRedirect,
    };

    await redis.set(id, JSON.stringify(dataToStore));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return NextResponse.json({
      id,
      generatedUrl: `${baseUrl}/${id}`,
    });

  } catch (error) {
    console.error('Error Generating Link:', error);
    return NextResponse.json({ error: 'Gagal memproses link' }, { status: 500 });
  }
}