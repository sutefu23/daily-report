import { describe, it, expect } from 'vitest';
import { JWTUtil } from '../jwt';
import { User } from '../../schemas/auth';

describe('JWTUtil', () => {
  const mockUser: User = {
    id: 1,
    name: '山田太郎',
    email: 'yamada@example.com',
    department: '営業1課',
    is_manager: false,
  };

  const mockManagerUser: User = {
    id: 2,
    name: '田中花子',
    email: 'tanaka@example.com',
    department: '営業1課',
    is_manager: true,
  };

  describe('generateAccessToken', () => {
    it('一般ユーザーのアクセストークンを生成できる', () => {
      const token = JWTUtil.generateAccessToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWTの構造確認
    });

    it('管理者ユーザーのアクセストークンを生成できる', () => {
      const token = JWTUtil.generateAccessToken(mockManagerUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('generateRefreshToken', () => {
    it('リフレッシュトークンを生成できる', () => {
      const token = JWTUtil.generateRefreshToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });
  });

  describe('generateTokenPair', () => {
    it('アクセストークンとリフレッシュトークンのペアを生成できる', () => {
      const { accessToken, refreshToken } = JWTUtil.generateTokenPair(mockUser);

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
      expect(typeof refreshToken).toBe('string');
      expect(accessToken).not.toBe(refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('有効なアクセストークンを検証できる', () => {
      const token = JWTUtil.generateAccessToken(mockUser);
      const payload = JWTUtil.verifyAccessToken(token);

      expect(payload).toBeDefined();
      expect(payload!.userId).toBe(mockUser.id);
      expect(payload!.email).toBe(mockUser.email);
      expect(payload!.isManager).toBe(mockUser.is_manager);
    });

    it('無効なトークンに対してnullを返す', () => {
      const payload = JWTUtil.verifyAccessToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('空文字列に対してnullを返す', () => {
      const payload = JWTUtil.verifyAccessToken('');
      expect(payload).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('有効なリフレッシュトークンを検証できる', () => {
      const token = JWTUtil.generateRefreshToken(mockUser);
      const payload = JWTUtil.verifyRefreshToken(token);

      expect(payload).toBeDefined();
      expect(payload!.userId).toBe(mockUser.id);
      expect(payload!.email).toBe(mockUser.email);
      expect(payload!.isManager).toBe(mockUser.is_manager);
    });

    it('無効なリフレッシュトークンに対してnullを返す', () => {
      const payload = JWTUtil.verifyRefreshToken('invalid-refresh-token');
      expect(payload).toBeNull();
    });
  });

  describe('getTokenExpiration', () => {
    it('トークンの有効期限を取得できる', () => {
      const token = JWTUtil.generateAccessToken(mockUser);
      const expiration = JWTUtil.getTokenExpiration(token);

      expect(expiration).toBeDefined();
      expect(typeof expiration).toBe('number');
      expect(expiration!).toBeGreaterThan(Date.now() / 1000);
    });

    it('無効なトークンに対してnullを返す', () => {
      const expiration = JWTUtil.getTokenExpiration('invalid-token');
      expect(expiration).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('有効期限内のトークンに対してfalseを返す', () => {
      const token = JWTUtil.generateAccessToken(mockUser);
      const isExpired = JWTUtil.isTokenExpired(token);

      expect(isExpired).toBe(false);
    });

    it('無効なトークンに対してtrueを返す', () => {
      const isExpired = JWTUtil.isTokenExpired('invalid-token');
      expect(isExpired).toBe(true);
    });
  });

  describe('トークンペイロード内容の確認', () => {
    it('管理者フラグが正しく設定される', () => {
      const managerToken = JWTUtil.generateAccessToken(mockManagerUser);
      const regularToken = JWTUtil.generateAccessToken(mockUser);

      const managerPayload = JWTUtil.verifyAccessToken(managerToken);
      const regularPayload = JWTUtil.verifyAccessToken(regularToken);

      expect(managerPayload!.isManager).toBe(true);
      expect(regularPayload!.isManager).toBe(false);
    });

    it('ユーザーIDとメールアドレスが正しく設定される', () => {
      const token = JWTUtil.generateAccessToken(mockUser);
      const payload = JWTUtil.verifyAccessToken(token);

      expect(payload!.userId).toBe(mockUser.id);
      expect(payload!.email).toBe(mockUser.email);
    });
  });
});
