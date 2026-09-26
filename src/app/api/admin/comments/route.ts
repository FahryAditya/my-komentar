import { NextResponse } from 'next/server';
import { getComments } from '@/lib/db';
import { verifyAdminSession } from '@/lib/auth';

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized. Silakan login sebagai admin.' }, { status: 401 });
  }

  const comments = await getComments();

  const total = comments.length;
  const unread = comments.filter(c => !c.isRead).length;
  const starred = comments.filter(c => c.isStarred).length;

  const categoryCounts = comments.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    success: true,
    data: comments,
    stats: {
      total,
      unread,
      starred,
      categoryCounts,
    },
  });
}
