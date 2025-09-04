import jwt from 'jsonwebtoken';
import { User } from '../schemas/auth';

export interface JWTPayload {
  userId: number;
  email: string;
  isManager: boolean;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const ACCESS_TOKEN_EXPIRES_IN = '1h'; // 1時間
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7日間

export class JWTUtil {
  /**
   * アクセストークンを生成する
   */
  static generateAccessToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      isManager: user.is_manager,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  /**
   * リフレッシュトークンを生成する
   */
  static generateRefreshToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      isManager: user.is_manager,
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  /**
   * アクセストークンとリフレッシュトークンのペアを生成する
   */
  static generateTokenPair(user: User): TokenPair {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  /**
   * アクセストークンを検証する
   */
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * リフレッシュトークンを検証する
   */
  static verifyRefreshToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * トークンの有効期限を取得する（Unixタイムスタンプ）
   */
  static getTokenExpiration(token: string): number | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      return decoded.exp || null;
    } catch {
      return null;
    }
  }

  /**
   * トークンが期限切れかどうかを確認する
   */
  static isTokenExpired(token: string): boolean {
    const exp = this.getTokenExpiration(token);
    if (!exp) return true;

    return Date.now() >= exp * 1000;
  }
}
