import { NextResponse } from 'next/server';
import { addComment } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, message, category, rating, isAnonymous } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Pesan komentar tidak boleh kosong.' },
        { status: 400 }
      );
    }

    if (message.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Pesan komentar maksimal 2000 karakter.' },
        { status: 400 }
      );
    }

    const saved = await addComment({
      name: name || 'Anonim',
      message,
      category,
      rating: typeof rating === 'number' ? rating : undefined,
      isAnonymous: Boolean(isAnonymous),
    });

    return NextResponse.json({
      success: true,
      message: 'Komentar berhasil dikirim dan tersimpan secara privat.',
      id: saved.id,
      createdAt: saved.createdAt,
    });
  } catch (error) {
    console.error('Error in POST /api/comments:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat menyimpan komentar.' },
      { status: 500 }
    );
  }
}
