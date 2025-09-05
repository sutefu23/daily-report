// テスト環境のセットアップファイル

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// 環境変数のモック設定
vi.stubEnv('NODE_ENV', 'test');

// グローバルなテスト設定があればここに記述
