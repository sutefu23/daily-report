import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/verify';

// Prismaのモック
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    customer: {
      count: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    $disconnect: vi.fn(),
  })),
}));

vi.mock('@/lib/auth/verify', () => ({
  verifyToken: vi.fn(),
}));

// テスト対象のインポート（モック設定後）
import { GET, POST } from './route';
import { PrismaClient } from '@prisma/client';

describe('/api/customers', () => {
  let prisma: any;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = new PrismaClient();
  });

  describe('GET /api/customers', () => {
    it('認証されていない場合は401を返す', async () => {
      vi.mocked(verifyToken).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/customers');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('AUTH_UNAUTHORIZED');
    });

    it('顧客一覧を正常に取得できる', async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        is_manager: false,
      });

      const mockCustomers = [
        {
          customerId: 1,
          companyName: 'ABC商事',
          contactPerson: '佐藤一郎',
          phone: '03-1234-5678',
          email: 'sato@abc.co.jp',
          address: '東京都千代田区',
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
        },
        {
          customerId: 2,
          companyName: 'XYZ工業',
          contactPerson: '鈴木二郎',
          phone: '06-2345-6789',
          email: 'suzuki@xyz.co.jp',
          address: '大阪府大阪市',
          createdAt: new Date('2025-01-02'),
          updatedAt: new Date('2025-01-02'),
        },
      ];

      prisma.customer.count.mockResolvedValue(2);
      prisma.customer.findMany.mockResolvedValue(mockCustomers);

      const request = new NextRequest('http://localhost/api/customers');
      const response = await GET(request);

      if (response.status !== 200) {
        const error = await response.json();
        console.error('API Error:', error);
      }
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveLength(2);
      expect(data.data[0].company_name).toBe('ABC商事');
      expect(data.pagination).toEqual({
        total: 2,
        page: 1,
        per_page: 20,
        total_pages: 1,
      });
    });

    it('検索パラメータで絞り込みができる', async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        is_manager: false,
      });

      const mockCustomer = {
        customerId: 1,
        companyName: 'ABC商事',
        contactPerson: '佐藤一郎',
        phone: '03-1234-5678',
        email: 'sato@abc.co.jp',
        address: '東京都千代田区',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      prisma.customer.count.mockResolvedValue(1);
      prisma.customer.findMany.mockResolvedValue([mockCustomer]);

      const request = new NextRequest('http://localhost/api/customers?search=ABC');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveLength(1);
      expect(data.data[0].company_name).toBe('ABC商事');

      expect(prisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                companyName: expect.objectContaining({
                  contains: 'ABC',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('ページネーションが正しく動作する', async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        is_manager: false,
      });

      prisma.customer.count.mockResolvedValue(50);
      prisma.customer.findMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/customers?page=2&per_page=10');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.per_page).toBe(10);
      expect(data.pagination.total_pages).toBe(5);
      expect(prisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });
  });

  describe('POST /api/customers', () => {
    it('認証されていない場合は401を返す', async () => {
      vi.mocked(verifyToken).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/customers', {
        method: 'POST',
        body: JSON.stringify({
          company_name: '新規顧客',
          contact_person: '田中太郎',
          phone: '03-9999-9999',
          email: 'tanaka@new.co.jp',
          address: '東京都新宿区',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('管理者でない場合は403を返す', async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        is_manager: false,
      });

      const request = new NextRequest('http://localhost/api/customers', {
        method: 'POST',
        body: JSON.stringify({
          company_name: '新規顧客',
          contact_person: '田中太郎',
          phone: '03-9999-9999',
          email: 'tanaka@new.co.jp',
          address: '東京都新宿区',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(403);
    });

    it('管理者の場合、顧客を作成できる', async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        is_manager: true,
      });

      const newCustomer = {
        customerId: 3,
        companyName: '新規顧客',
        contactPerson: '田中太郎',
        phone: '03-9999-9999',
        email: 'tanaka@new.co.jp',
        address: '東京都新宿区',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.customer.create.mockResolvedValue(newCustomer);

      const request = new NextRequest('http://localhost/api/customers', {
        method: 'POST',
        body: JSON.stringify({
          company_name: '新規顧客',
          contact_person: '田中太郎',
          phone: '03-9999-9999',
          email: 'tanaka@new.co.jp',
          address: '東京都新宿区',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.company_name).toBe('新規顧客');
    });

    it('不正なデータの場合はバリデーションエラーを返す', async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        is_manager: true,
      });

      const request = new NextRequest('http://localhost/api/customers', {
        method: 'POST',
        body: JSON.stringify({
          company_name: '', // 必須項目が空
          contact_person: '',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});