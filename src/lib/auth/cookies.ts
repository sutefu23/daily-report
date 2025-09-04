import { serialize, parse } from 'cookie';
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
    const accessCookie = serialize(ACCESS_TOKEN_NAME, accessToken, {
      ...this.getDefaultOptions(),
      maxAge: 60 * 60, // 1時間
    });

    const refreshCookie = serialize(REFRESH_TOKEN_NAME, refreshToken, {
      ...this.getDefaultOptions(),
      maxAge: COOKIE_MAX_AGE, // 7日間
    });

    response.headers.set('Set-Cookie', `${accessCookie}, ${refreshCookie}`);
  }

  /**
   * リクエストからアクセストークンを取得する
   */
  static getAccessToken(request: NextRequest): string | null {
    const cookies = parse(request.headers.get('cookie') || '');
    return cookies[ACCESS_TOKEN_NAME] || null;
  }

  /**
   * リクエストからリフレッシュトークンを取得する
   */
  static getRefreshToken(request: NextRequest): string | null {
    const cookies = parse(request.headers.get('cookie') || '');
    return cookies[REFRESH_TOKEN_NAME] || null;
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
    const accessCookie = serialize(ACCESS_TOKEN_NAME, '', {
      ...this.getDefaultOptions(),
      maxAge: 0,
    });

    const refreshCookie = serialize(REFRESH_TOKEN_NAME, '', {
      ...this.getDefaultOptions(),
      maxAge: 0,
    });

    response.headers.set('Set-Cookie', `${accessCookie}, ${refreshCookie}`);
  }
}
