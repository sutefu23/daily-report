import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  return requireAuth(request, async (req) => {
    // 認証が成功した場合
    return NextResponse.json(
      {
        message: '認証されたユーザーのみアクセス可能です',
        user: {
          id: req.user.userId,
          email: req.user.email,
          isManager: req.user.isManager,
        },
      },
      { status: 200 }
    );
  });
}
