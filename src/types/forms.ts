/**
 * フォーム関連の型定義
 */

// ログインフォーム
export interface LoginFormData {
  email: string;
  password: string;
}

// 日報フォーム
export interface ReportFormData {
  report_date: string;
  visits: VisitFormData[];
  problem: string;
  plan: string;
}

export interface VisitFormData {
  id?: string; // フォーム上では一時的なID
  customer_id: string;
  visit_time?: string;
  visit_content: string;
}

// 顧客フォーム
export interface CustomerFormData {
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
}

// 営業担当者フォーム
export interface SalesPersonFormData {
  name: string;
  email: string;
  password?: string; // 新規作成時のみ必須
  password_confirmation?: string; // パスワード確認用
  department: string;
  is_manager: boolean;
}

// コメントフォーム
export interface CommentFormData {
  comment: string;
}

// 検索フォーム
export interface ReportSearchFormData {
  start_date?: string;
  end_date?: string;
  sales_person_id?: string;
}

export interface CustomerSearchFormData {
  search?: string;
}

// バリデーションエラー
export interface FormError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | FormErrors;
}

// フォームの状態
export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

// バリデーションルール
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

// バリデーション定数
export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  },
  password: {
    required: true,
    minLength: 8,
  },
  visitContent: {
    required: true,
    maxLength: 500,
  },
  problem: {
    required: true,
    maxLength: 1000,
  },
  plan: {
    required: true,
    maxLength: 1000,
  },
  comment: {
    required: true,
    maxLength: 500,
  },
  companyName: {
    required: true,
    maxLength: 100,
  },
  personName: {
    required: true,
    maxLength: 50,
  },
  phone: {
    pattern: /^[0-9-]+$/,
    maxLength: 20,
  },
} as const;

// エラーメッセージ
export const ERROR_MESSAGES = {
  required: (field: string) => `${field}は必須項目です`,
  minLength: (field: string, length: number) =>
    `${field}は${length}文字以上で入力してください`,
  maxLength: (field: string, length: number) =>
    `${field}は${length}文字以内で入力してください`,
  email: 'メールアドレスの形式が正しくありません',
  phone: '電話番号の形式が正しくありません',
  passwordConfirmation: 'パスワードが一致しません',
  duplicate: (field: string) => `${field}が既に存在します`,
} as const;
