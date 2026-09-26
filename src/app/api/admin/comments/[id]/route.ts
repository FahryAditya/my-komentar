import { NextResponse } from 'next/server';
import { updateComment, deleteComment } from '@/lib/db';
import { verifyAdminSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const updated = await updateComment(id, {
      isRead: typeof body.isRead === 'boolean' ? body.isRead : undefined,
      isStarred: typeof body.isStarred === 'boolean' ? body.isStarred : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Komentar tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Gagal memperbarui komentar.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const deleted = await deleteComment(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Komentar tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Komentar berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Gagal menghapus komentar.' }, { status: 500 });
  }
}
