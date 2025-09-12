import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { JWTUtil, CookieUtil } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Cookieからリフレッシュトークンを取得
    const refreshToken = CookieUtil.getRefreshToken(request);

    if (!refreshToken) {
      return NextResponse.json(
        {
          error: {
            code: 'REFRESH_TOKEN_MISSING',
            message: 'リフレッシュトークンが見つかりません',
          },
        },
        { status: 401 }
      );
    }

    // リフレッシュトークンを検証
    const payload = JWTUtil.verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        {
          error: {
            code: 'REFRESH_TOKEN_INVALID',
            message: '無効なリフレッシュトークンです',
          },
        },
        { status: 401 }
      );
    }

    // ユーザーが存在するか確認
    const user = await prisma.salesPerson.findUnique({
      where: {
        salesPersonId: payload.userId,
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

    // 新しいトークンペアを生成
    const userForToken = {
      id: user.salesPersonId,
      name: user.name,
      email: user.email,
      department: user.department,
      is_manager: user.isManager,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      JWTUtil.generateTokenPair(userForToken);

    // レスポンス作成
    const response = NextResponse.json(
      {
        token: accessToken,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1時間後
        user: userForToken,
      },
      { status: 200 }
    );

    // 新しいトークンをCookieに設定
    CookieUtil.setTokens(response, accessToken, newRefreshToken);

    return response;
  } catch (error) {
    console.error('トークンリフレッシュエラー:', error);

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
}
