// API共通型定義

/**
 * APIエラーレスポンス
 */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

/**
 * ページネーション情報
 */
export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/**
 * ページネーション付きレスポンス
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * 営業担当者
 */
export interface SalesPerson {
  id: number;
  name: string;
  email: string;
  department: string;
  is_manager: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * 顧客
 */
export interface Customer {
  id: number;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 日報
 */
export interface DailyReport {
  id: number;
  sales_person_id: number;
  report_date: string; // YYYY-MM-DD format
  problem: string;
  plan: string;
  sales_person: {
    id: number;
    name: string;
    email?: string;
  };
  visits: VisitRecord[];
  comments: ManagerComment[];
  created_at: Date;
  updated_at: Date;
}

/**
 * 訪問記録
 */
export interface VisitRecord {
  id: number;
  report_id: number;
  customer_id: number;
  visit_content: string;
  visit_time?: string; // HH:MM format
  customer: {
    id: number;
    company_name: string;
  };
  created_at: Date;
}

/**
 * 管理者コメント
 */
export interface ManagerComment {
  id: number;
  report_id: number;
  manager_id: number;
  comment: string;
  manager: {
    id: number;
    name: string;
  };
  created_at: Date;
}
