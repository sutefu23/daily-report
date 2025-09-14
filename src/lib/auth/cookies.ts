import { serialize } from 'cookie';
import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN_NAME = 'access_token';
const REFRESH_TOKEN_NAME = 'refresh_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7日間（秒単位）

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
}

export class CookieUtil {
  /**
   * デフォルトのCookieオプション
   */
  private static getDefaultOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };
  }

  /**
   * アクセストークンをCookieに設定する
   */
  static setAccessToken(response: NextResponse, token: string): void {
    const cookie = serialize(ACCESS_TOKEN_NAME, token, {
      ...this.getDefaultOptions(),
      maxAge: 60 * 60, // 1時間
    });

    response.headers.set('Set-Cookie', cookie);
  }

  /**
   * リフレッシュトークンをCookieに設定する
   */
  static setRefreshToken(response: NextResponse, token: string): void {
    const cookie = serialize(REFRESH_TOKEN_NAME, token, {
      ...this.getDefaultOptions(),
      maxAge: COOKIE_MAX_AGE, // 7日間
    });

    // 既存のSet-Cookieヘッダーに追加
    const existingCookies = response.headers.get('Set-Cookie') || '';
    const newCookies = existingCookies
      ? `${existingCookies}, ${cookie}`
      : cookie;
    response.headers.set('Set-Cookie', newCookies);
  }

  /**
   * 両方のトークンをCookieに設定する
   */
  static setTokens(
    response: NextResponse,
    accessToken: string,
    refreshToken: string
  ): void {
    // Use response.cookies.set() instead of headers to properly handle multiple cookies
    response.cookies.set(ACCESS_TOKEN_NAME, accessToken, {
      ...this.getDefaultOptions(),
      maxAge: 60 * 60, // 1時間
    });

    response.cookies.set(REFRESH_TOKEN_NAME, refreshToken, {
      ...this.getDefaultOptions(),
      maxAge: COOKIE_MAX_AGE, // 7日間
    });
  }

  /**
   * リクエストからアクセストークンを取得する
   */
  static getAccessToken(request: NextRequest): string | null {
    // Use Next.js request.cookies API instead of parsing manually
    return request.cookies.get(ACCESS_TOKEN_NAME)?.value || null;
  }

  /**
   * リクエストからリフレッシュトークンを取得する
   */
  static getRefreshToken(request: NextRequest): string | null {
    // Use Next.js request.cookies API instead of parsing manually
    return request.cookies.get(REFRESH_TOKEN_NAME)?.value || null;
  }

  /**
   * アクセストークンを削除する
   */
  static clearAccessToken(response: NextResponse): void {
    const cookie = serialize(ACCESS_TOKEN_NAME, '', {
      ...this.getDefaultOptions(),
      maxAge: 0, // 即座に期限切れ
    });

    response.headers.set('Set-Cookie', cookie);
  }

  /**
   * リフレッシュトークンを削除する
   */
  static clearRefreshToken(response: NextResponse): void {
    const cookie = serialize(REFRESH_TOKEN_NAME, '', {
      ...this.getDefaultOptions(),
      maxAge: 0, // 即座に期限切れ
    });

    // 既存のSet-Cookieヘッダーに追加
    const existingCookies = response.headers.get('Set-Cookie') || '';
    const newCookies = existingCookies
      ? `${existingCookies}, ${cookie}`
      : cookie;
    response.headers.set('Set-Cookie', newCookies);
  }

  /**
   * 両方のトークンを削除する
   */
  static clearTokens(response: NextResponse): void {
    // Use response.cookies.set() with maxAge: 0 to delete cookies
    response.cookies.set(ACCESS_TOKEN_NAME, '', {
      ...this.getDefaultOptions(),
      maxAge: 0,
    });

    response.cookies.set(REFRESH_TOKEN_NAME, '', {
      ...this.getDefaultOptions(),
      maxAge: 0,
    });
  }
}
