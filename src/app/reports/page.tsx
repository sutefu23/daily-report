'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api, ApiError } from '@/lib/api/simple-client';
import { ReportSummary, PaginatedResponse } from '@/types/api';
import { 
  Plus, 
  Calendar,
  User,
  Building2,
  MessageSquare,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

function ReportsListContent() {
  const router = useRouter();
  const { user, isManager, logout } = useAuth();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: PaginatedResponse<ReportSummary> = await api.reports.getAll({
        page: 1,
        per_page: 20
      });
      setReports(response.data || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('日報の取得に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleReportClick = (reportId: number) => {
    router.push(`/reports/${reportId}`);
  };

  const handleCreateReport = () => {
    router.push('/reports/new');
  };

  return (
    <DashboardLayout
      isManager={isManager}
      userName={user?.name || ''}
      onLogout={handleLogout}
    >
      <div className="container max-w-6xl mx-auto py-6 px-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">日報一覧</h1>
            <Button onClick={handleCreateReport}>
              <Plus className="mr-2 h-4 w-4" />
              新規日報作成
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Reports List */}
          {!isLoading && reports.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">日報がまだありません</p>
                <Button onClick={handleCreateReport}>
                  <Plus className="mr-2 h-4 w-4" />
                  最初の日報を作成
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && reports.length > 0 && (
            <div className="space-y-3">
              {reports.map((report) => (
                <Card 
                  key={report.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleReportClick(report.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {format(new Date(report.report_date), 'yyyy年MM月dd日(E)', {
                                locale: ja,
                              })}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{report.sales_person.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Building2 className="mr-1 h-3 w-3" />
                            <span>訪問: {report.visit_count}件</span>
                          </div>
                          {report.has_comments && (
                            <div className="flex items-center text-primary">
                              <MessageSquare className="mr-1 h-3 w-3" />
                              <span>コメントあり</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ReportsListPage() {
  return (
    <AuthProvider>
      <ReportsListContent />
    </AuthProvider>
  );
}