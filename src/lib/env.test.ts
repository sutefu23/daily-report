import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { env } from './env';

describe('EnvConfig', () => {
  beforeEach(() => {
    // 環境変数をリセット
    vi.resetModules();
    vi.unstubAllEnvs();
    // envのキャッシュをクリア
    env.clearCache();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  describe('validate', () => {
    it('validates successfully when all required env vars are set', () => {
      vi.stubEnv('DATABASE_URL', 'postgresql://test');
      vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');
      vi.stubEnv('NEXTAUTH_SECRET', 'test-secret');
      vi.stubEnv('JWT_SECRET', 'jwt-secret');

      expect(() => env.validate()).not.toThrow();
    });

    it('warns in development when required env vars are missing', () => {
      vi.stubEnv('NODE_ENV', 'development');
      // 環境変数を削除するには、undefinedを設定
      vi.stubEnv('DATABASE_URL', undefined);

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      env.validate();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing required environment variables')
      );

      warnSpy.mockRestore();
    });

    it('throws error in production when required env vars are missing', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('DATABASE_URL', undefined);

      expect(() => env.validate()).toThrow(
        'Missing required environment variables'
      );
    });
  });

  describe('get', () => {
    beforeEach(() => {
      vi.stubEnv('DATABASE_URL', 'postgresql://test');
      vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');
      vi.stubEnv('NEXTAUTH_SECRET', 'test-secret');
      vi.stubEnv('JWT_SECRET', 'jwt-secret');
    });

    it('returns value for required env var', () => {
      const value = env.get('DATABASE_URL');
      expect(value).toBe('postgresql://test');
    });

    it('returns default value for optional env var when not set', () => {
      vi.stubEnv('JWT_EXPIRES_IN', undefined);
      const value = env.get('JWT_EXPIRES_IN');
      expect(value).toBe('1h');
    });

    it('returns custom value for optional env var when set', () => {
      vi.stubEnv('JWT_EXPIRES_IN', '2h');
      const value = env.get('JWT_EXPIRES_IN');
      expect(value).toBe('2h');
    });

    it('throws error for missing required env var', () => {
      vi.stubEnv('DATABASE_URL', undefined);
      expect(() => env.get('DATABASE_URL')).toThrow(
        'Environment variable DATABASE_URL is not set'
      );
    });
  });

  describe('getAll', () => {
    it('returns all env vars with values', () => {
      vi.stubEnv('DATABASE_URL', 'postgresql://test');
      vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');
      vi.stubEnv('NEXTAUTH_SECRET', 'test-secret');
      vi.stubEnv('JWT_SECRET', 'jwt-secret');
      vi.stubEnv('NODE_ENV', 'test');

      const config = env.getAll();

      expect(config.DATABASE_URL).toBe('postgresql://test');
      expect(config.NEXTAUTH_URL).toBe('http://localhost:3000');
      expect(config.NEXTAUTH_SECRET).toBe('test-secret');
      expect(config.JWT_SECRET).toBe('jwt-secret');
      expect(config.JWT_EXPIRES_IN).toBe('1h'); // default value
      expect(config.NODE_ENV).toBe('test');
    });
  });

  describe('environment checks', () => {
    beforeEach(() => {
      // 必須環境変数を設定
      vi.stubEnv('DATABASE_URL', 'postgresql://test');
      vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');
      vi.stubEnv('NEXTAUTH_SECRET', 'test-secret');
      vi.stubEnv('JWT_SECRET', 'jwt-secret');
    });

    it('isProduction returns true when NODE_ENV is production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      expect(env.isProduction()).toBe(true);
    });

    it('isProduction returns false when NODE_ENV is not production', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(env.isProduction()).toBe(false);
    });

    it('isDevelopment returns true when NODE_ENV is development', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(env.isDevelopment()).toBe(true);
    });

    it('isDevelopment returns false when NODE_ENV is not development', () => {
      vi.stubEnv('NODE_ENV', 'production');
      expect(env.isDevelopment()).toBe(false);
    });

    it('isTest returns true when NODE_ENV is test', () => {
      vi.stubEnv('NODE_ENV', 'test');
      expect(env.isTest()).toBe(true);
    });

    it('isTest returns false when NODE_ENV is not test', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(env.isTest()).toBe(false);
    });
  });
});
