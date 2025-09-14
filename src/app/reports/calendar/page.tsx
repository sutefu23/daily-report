'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ReportCalendar } from '@/components/reports/ReportCalendar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface Report {
  id: number;
  report_date: string;
  sales_person: {
    name: string;
  };
  visit_count: number;
  has_comments: boolean;
}

export default function ReportCalendarPage() {
  const { user, isManager, logout } = useAuth();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports(currentMonth);
  }, [currentMonth]);

  const fetchReports = async (date: Date) => {
    setIsLoading(true);
    try {
      const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(date), 'yyyy-MM-dd');
      
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        per_page: '100', // カレンダー表示のため多めに取得
      });

      // 管理者でない場合は自分の日報のみ取得
      if (!isManager && user?.id) {
        params.append('sales_person_id', user.id.toString());
      }

      const response = await fetch(`/api/reports?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('日報の取得に失敗しました');
      }

      const data = await response.json();
      setReports(data.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'エラー',
        description: '日報の取得に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  return (
    <DashboardLayout
      isManager={isManager}
      userName={user?.name}
      onLogout={logout}
    >
      <div className="space-y-6">
        <PageHeader
          title="日報カレンダー"
          description="月間の日報をカレンダー形式で表示します"
        />

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[600px] w-full" />
          </div>
        ) : (
          <ReportCalendar
            initialDate={currentMonth}
            reports={reports}
            onMonthChange={handleMonthChange}
            isLoading={isLoading}
          />
        )}
      </div>
    </DashboardLayout>
  );
}