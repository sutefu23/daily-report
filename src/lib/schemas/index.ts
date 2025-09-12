// 共通スキーマ
export { ErrorResponseSchema, PaginationSchema, IdParamSchema } from './common';
export type { ErrorResponse, Pagination, IdParam } from './common';

// 認証関連
export * from './auth';

// 営業担当者関連
export * from './sales-person';

// 顧客関連
export * from './customer';

// 日報関連
export {
  VisitRecordSchema,
  CreateReportRequestSchema,
  UpdateReportRequestSchema,
  CreateCommentRequestSchema,
  CreateReportResponseSchema,
  CreateCommentResponseSchema,
} from './report';
export type {
  VisitRecord,
  CreateReportRequest,
  UpdateReportRequest,
  CreateCommentRequest,
  CreateReportResponse,
  CreateCommentResponse,
} from './report';
