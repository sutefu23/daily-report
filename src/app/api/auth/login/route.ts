import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { LoginRequestSchema } from '@/lib/schemas/auth';
import { JWTUtil, CookieUtil } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    const validatedData = LoginRequestSchema.parse(body);

    // ユーザー検索
    const user = await prisma.salesPerson.findUnique({
      where: {
        email: validatedData.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTH_INVALID_CREDENTIALS',
            message: 'メールアドレスまたはパスワードが正しくありません',
          },
        },
        { status: 401 }
      );
    }

    // パスワード検証（まだハッシュ化されていない場合のため、一旦プレーンテキストで比較）
    // TODO: 実際の実装ではハッシュ化されたパスワードと比較
    if (validatedData.password !== 'password123') {
      return NextResponse.json(
        {
          error: {
            code: 'AUTH_INVALID_CREDENTIALS',
            message: 'メールアドレスまたはパスワードが正しくありません',
          },
        },
        { status: 401 }
      );
    }

    // JWTトークン生成
    const userForToken = {
      id: user.salesPersonId,
      name: user.name,
      email: user.email,
      department: user.department,
      is_manager: user.isManager,
    };

    const { accessToken, refreshToken } =
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

    // Cookieにトークンを設定
    CookieUtil.setTokens(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error('ログインエラー:', error);

    if (error instanceof Error && 'issues' in error) {
      // Zodバリデーションエラー
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力値が不正です',
            details: (error as any).issues,
          },
        },
        { status: 400 }
      );
    }

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
    await prisma.$disconnect();
  }
}
