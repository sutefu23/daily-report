'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Plus, Search, Calendar, User, MessageSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import type { DailyReportListItem } from '@/lib/schemas/report';

interface ReportsPageData {
  data: DailyReportListItem[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<DailyReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // 検索条件
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSalesPerson, setSelectedSalesPerson] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // ページネーション
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 1,
  });

  // 認証チェックとユーザー情報取得
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
          }
          throw new Error('認証に失敗しました');
        }
        const userData = await response.json();
        setCurrentUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        setError('認証チェックに失敗しました');
      }
    };

    checkAuth();
  }, [router]);

  // 日報一覧取得
  const fetchReports = async (searchParams?: URLSearchParams) => {
    try {
      setSearchLoading(true);
      setError(null);

      const params = searchParams || new URLSearchParams();
      if (startDate) params.set('start_date', startDate);
      if (endDate) params.set('end_date', endDate);
      if (selectedSalesPerson && currentUser?.is_manager) {
        params.set('sales_person_id', selectedSalesPerson);
      }

      const url = `/api/reports${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('日報の取得に失敗しました');
      }

      const data: ReportsPageData = await response.json();
      setReports(data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setError(error instanceof Error ? error.message : '日報の取得に失敗しました');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    if (currentUser) {
      fetchReports();
    }
  }, [currentUser]);

  // 検索実行
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  // 新規日報作成画面へ
  const handleCreateReport = () => {
    router.push('/reports/new');
  };

  // 日報詳細画面へ
  const handleViewReport = (reportId: number) => {
    router.push(`/reports/${reportId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">日報を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">日報一覧</h1>
          <Button onClick={handleCreateReport} className="gap-2">
            <Plus className="h-4 w-4" />
            新規日報作成
          </Button>
        </div>

        {/* 検索フォーム */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              検索条件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="start-date">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    開始日
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    終了日
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                {currentUser?.is_manager && (
                  <div className="space-y-2">
                    <Label htmlFor="sales-person">
                      <User className="inline h-4 w-4 mr-1" />
                      営業担当
                    </Label>
                    <Select
                      value={selectedSalesPerson}
                      onValueChange={setSelectedSalesPerson}
                    >
                      <SelectTrigger id="sales-person">
                        <SelectValue placeholder="全員" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">全員</SelectItem>
                        {/* ここに営業担当者リストを追加 */}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={searchLoading}>
                  {searchLoading ? (
                    <>検索中...</>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      検索
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* エラー表示 */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 日報一覧テーブル */}
        <Card>
          <CardHeader>
            <CardTitle>日報一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>日報がありません</p>
                <Button onClick={handleCreateReport} variant="outline" className="mt-4">
                  最初の日報を作成
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日付</TableHead>
                      <TableHead>営業担当</TableHead>
                      <TableHead className="text-center">訪問件数</TableHead>
                      <TableHead className="text-center">コメント</TableHead>
                      <TableHead className="text-center">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          {format(new Date(report.report_date), 'yyyy/MM/dd(E)', {
                            locale: ja,
                          })}
                        </TableCell>
                        <TableCell>{report.sales_person.name}</TableCell>
                        <TableCell className="text-center">
                          {report.visit_count}件
                        </TableCell>
                        <TableCell className="text-center">
                          {report.has_comments ? (
                            <MessageSquare className="h-4 w-4 mx-auto text-green-600" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReport(report.id)}
                          >
                            詳細
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* ページネーション */}
            {pagination.total_pages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  全{pagination.total}件中 {(pagination.page - 1) * pagination.per_page + 1}-
                  {Math.min(pagination.page * pagination.per_page, pagination.total)}件を表示
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set('page', String(pagination.page - 1));
                      fetchReports(params);
                    }}
                    disabled={pagination.page <= 1}
                  >
                    前へ
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set('page', String(pagination.page + 1));
                      fetchReports(params);
                    }}
                    disabled={pagination.page >= pagination.total_pages}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}