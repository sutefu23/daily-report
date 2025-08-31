import { describe, it, expect, beforeEach, vi } from 'vitest';
import { env } from './env';

describe('EnvConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // 環境変数をリセット
    vi.resetModules();
    process.env = { ...originalEnv };
    // envのキャッシュをクリア
    env.clearCache();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validate', () => {
    it('validates successfully when all required env vars are set', () => {
      process.env.DATABASE_URL = 'postgresql://test';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.NEXTAUTH_SECRET = 'test-secret';
      process.env.JWT_SECRET = 'jwt-secret';

      expect(() => env.validate()).not.toThrow();
    });

    it('warns in development when required env vars are missing', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.DATABASE_URL;

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      env.validate();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing required environment variables')
      );

      warnSpy.mockRestore();
    });

    it('throws error in production when required env vars are missing', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.DATABASE_URL;

      expect(() => env.validate()).toThrow(
        'Missing required environment variables'
      );
    });
  });

  describe('get', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'postgresql://test';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.NEXTAUTH_SECRET = 'test-secret';
      process.env.JWT_SECRET = 'jwt-secret';
    });

    it('returns value for required env var', () => {
      const value = env.get('DATABASE_URL');
      expect(value).toBe('postgresql://test');
    });

    it('returns default value for optional env var when not set', () => {
      delete process.env.JWT_EXPIRES_IN;
      const value = env.get('JWT_EXPIRES_IN');
      expect(value).toBe('1h');
    });

    it('returns custom value for optional env var when set', () => {
      process.env.JWT_EXPIRES_IN = '2h';
      const value = env.get('JWT_EXPIRES_IN');
      expect(value).toBe('2h');
    });

    it('throws error for missing required env var', () => {
      delete process.env.DATABASE_URL;
      expect(() => env.get('DATABASE_URL')).toThrow(
        'Environment variable DATABASE_URL is not set'
      );
    });
  });

  describe('getAll', () => {
    it('returns all env vars with values', () => {
      process.env.DATABASE_URL = 'postgresql://test';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.NEXTAUTH_SECRET = 'test-secret';
      process.env.JWT_SECRET = 'jwt-secret';
      process.env.NODE_ENV = 'test';

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
      process.env.DATABASE_URL = 'postgresql://test';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.NEXTAUTH_SECRET = 'test-secret';
      process.env.JWT_SECRET = 'jwt-secret';
    });

    it('isProduction returns true when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      expect(env.isProduction()).toBe(true);
    });

    it('isProduction returns false when NODE_ENV is not production', () => {
      process.env.NODE_ENV = 'development';
      expect(env.isProduction()).toBe(false);
    });

    it('isDevelopment returns true when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      expect(env.isDevelopment()).toBe(true);
    });

    it('isDevelopment returns false when NODE_ENV is not development', () => {
      process.env.NODE_ENV = 'production';
      expect(env.isDevelopment()).toBe(false);
    });

    it('isTest returns true when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      expect(env.isTest()).toBe(true);
    });

    it('isTest returns false when NODE_ENV is not test', () => {
      process.env.NODE_ENV = 'development';
      expect(env.isTest()).toBe(false);
    });
  });
});
