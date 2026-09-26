import { NextResponse } from 'next/server';
import { updateAdminPin } from '@/lib/db';
import { verifyAdminSession, createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { newPin } = await request.json();
    if (!newPin || typeof newPin !== 'string' || newPin.trim().length < 4) {
      return NextResponse.json(
        { error: 'PIN baru minimal harus 4 karakter.' },
        { status: 400 }
      );
    }

    const success = await updateAdminPin(newPin.trim());
    if (!success) {
      return NextResponse.json({ error: 'Gagal memperbarui PIN.' }, { status: 500 });
    }

    const response = NextResponse.json({
      success: true,
      message: 'PIN Admin berhasil diperbarui.',
    });

    const newToken = createAdminToken(newPin.trim());
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat memperbarui pengaturan.' },
      { status: 500 }
    );
  }
}
