import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { nanoid } from 'nanoid';

export async function POST(request) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: 'URL video wajib diisi' }, { status: 400 });
    }

    // Generate ID unik 6 karakter (contoh: a1B2c3)
    const id = nanoid(6);

    // Simpan pasangan (ID -> videoUrl) ke Redis
    await redis.set(id, videoUrl);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    return NextResponse.json({ 
      id, 
      generatedUrl: `${baseUrl}/${id}` 
    });

  } catch (error) {
    console.error('Error Generating Link:', error);
    return NextResponse.json({ error: 'Gagal memproses link' }, { status: 500 });
  }
}