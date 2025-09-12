import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  return requireAuth(request, async (req) => {
    try {
      // 認証されたユーザー情報を取得
      const user = await prisma.salesPerson.findUnique({
        where: {
          salesPersonId: req.user.userId,
        },
        select: {
          salesPersonId: true,
          name: true,
          email: true,
          department: true,
          isManager: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          {
            error: {
              code: 'USER_NOT_FOUND',
              message: 'ユーザーが見つかりません',
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: user.salesPersonId,
        name: user.name,
        email: user.email,
        department: user.department,
        is_manager: user.isManager,
      });
    } catch (error) {
      console.error('/me APIエラー:', error);

      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'サーバーエラーが発生しました',
          },
        },
        { status: 500 }
      );
    } finally {
      // await prisma.$disconnect(); // Not needed with singleton
    }
  });
}
