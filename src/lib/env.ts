/**
 * 環境変数の検証とアクセス用ユーティリティ
 */

// 必須環境変数のリスト
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'JWT_SECRET',
] as const;

// オプション環境変数のデフォルト値
const optionalEnvVars = {
  JWT_EXPIRES_IN: '1h',
  NODE_ENV: 'development',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_APP_NAME: '営業日報システム',
} as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];
type OptionalEnvVar = keyof typeof optionalEnvVars;
type EnvVar = RequiredEnvVar | OptionalEnvVar;

class EnvConfig {
  private validated = false;
  private cache: Partial<Record<EnvVar, string>> = {};

  constructor() {
    // テスト環境ではキャッシュをクリア
    if (process.env.NODE_ENV === 'test') {
      this.clearCache();
    }
  }

  clearCache(): void {
    this.validated = false;
    this.cache = {};
  }

  /**
   * 環境変数を検証
   * @throws {Error} 必須環境変数が設定されていない場合
   */
  validate(): void {
    if (this.validated) return;

    const missing: string[] = [];

    for (const key of requiredEnvVars) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      const errorMessage = `Missing required environment variables: ${missing.join(', ')}
Please create a .env.local file based on .env.local.example and set the required values.`;

      // 開発環境では警告のみ、本番環境ではエラー
      if (process.env.NODE_ENV === 'production') {
        throw new Error(errorMessage);
      } else {
        console.warn(`⚠️  ${errorMessage}`);
      }
    }

    this.validated = true;
  }

  /**
   * 環境変数を取得
   * @param key 環境変数名
   * @returns 環境変数の値
   */
  get<T extends EnvVar>(key: T): string {
    if (!this.validated) {
      this.validate();
    }

    // キャッシュチェック
    if (this.cache[key]) {
      return this.cache[key];
    }

    // 環境変数取得
    const value = process.env[key];

    // 必須環境変数の場合
    if (requiredEnvVars.includes(key as RequiredEnvVar)) {
      if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
      }
      this.cache[key] = value;
      return value;
    }

    // オプション環境変数の場合
    const defaultValue = optionalEnvVars[key as OptionalEnvVar];
    const result = value || defaultValue;
    this.cache[key] = result;
    return result;
  }

  /**
   * 全ての設定を取得
   */
  getAll(): Record<EnvVar, string> {
    if (!this.validated) {
      this.validate();
    }

    const config = {} as Record<EnvVar, string>;

    // 必須環境変数
    for (const key of requiredEnvVars) {
      config[key] = this.get(key);
    }

    // オプション環境変数
    for (const key in optionalEnvVars) {
      config[key as OptionalEnvVar] = this.get(key as OptionalEnvVar);
    }

    return config;
  }

  /**
   * 環境が本番かどうかをチェック
   */
  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * 環境が開発かどうかをチェック
   */
  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * 環境がテストかどうかをチェック
   */
  isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  }
}

// シングルトンインスタンス
export const env = new EnvConfig();

// 初期化時に検証を実行（Next.jsサーバー起動時）
if (typeof window === 'undefined') {
  env.validate();
}
