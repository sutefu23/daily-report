import { NextRequest, NextResponse } from 'next/server';
import { requireManager } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  return requireManager(request, async (req) => {
    // 管理者権限の確認が成功した場合
    return NextResponse.json(
      {
        message: '管理者権限が確認されました',
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
