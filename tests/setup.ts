import { vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { createMockPrismaClient } from './utils/prisma-mock';

// Next.js環境変数のモック
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'file:./test.db';

// グローバルモックセットアップ
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// IntersectionObserver のモック
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// matchMedia のモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Next.js Routerのモック
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Prismaのグローバルモック
const mockPrisma = createMockPrismaClient();

// src/lib/prisma.tsのモック
vi.mock('../src/lib/prisma', () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

// エイリアスパスのモック
vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

// console.error のモック（テストでエラーログを抑制）
const originalError = console.error;
beforeEach(() => {
  // エラーログを出力しつつ、モック関数として記録する
  console.error = vi.fn((...args) => {
    originalError(...args); // 実際のエラーを出力
  });
});

afterEach(() => {
  console.error = originalError;
});
