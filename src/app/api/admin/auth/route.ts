import { NextResponse } from 'next/server';
import { getAdminSettings } from '@/lib/db';
import { createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    const settings = await getAdminSettings();

    if (!pin || pin.trim() !== settings.adminPin) {
      return NextResponse.json(
        { error: 'PIN / Password Admin salah. Silakan coba lagi.' },
        { status: 401 }
      );
    }

    const token = createAdminToken(settings.adminPin);
    const response = NextResponse.json({
      success: true,
      message: 'Autentikasi berhasil.',
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error in POST /api/admin/auth:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses login.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout berhasil.',
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
