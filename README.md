# 営業日報システム

営業担当者が日々の活動を報告し、上長がフィードバックを行うための営業日報管理システムです。

## 🚀 技術スタック

- **フレームワーク**: Next.js 15.5.2 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 3.4
- **データベース**: PostgreSQL + Prisma ORM
- **認証**: JWT (予定)
- **テスト**: Vitest + Testing Library
- **コード品質**: ESLint + Prettier + Husky

## 📋 前提条件

- Node.js 18.0.0 以上
- npm 9.0.0 以上
- PostgreSQL 14 以上 (データベース機能使用時)

## 🛠 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/sutefu23/daily-report.git
cd daily-report
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、必要な値を設定してください。

```bash
cp .env.local.example .env.local
```

必要な環境変数:

- `DATABASE_URL`: PostgreSQL接続文字列
- `NEXTAUTH_SECRET`: 認証用シークレットキー
- `JWT_SECRET`: JWT署名用シークレットキー

### 4. データベースのセットアップ (今後実装予定)

```bash
# Prismaのマイグレーション実行
npx prisma migrate dev

# 初期データの投入
npx prisma db seed
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## 📁 プロジェクト構成

```
daily-report/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # ルートレイアウト
│   │   ├── page.tsx          # ホームページ
│   │   ├── error.tsx         # エラーハンドリング
│   │   ├── loading.tsx       # ローディング状態
│   │   ├── not-found.tsx     # 404ページ
│   │   └── globals.css       # グローバルスタイル
│   ├── components/           # 共通コンポーネント (今後追加)
│   ├── lib/                  # ユーティリティ関数 (今後追加)
│   └── types/                # TypeScript型定義
├── prisma/
│   └── schema.prisma         # データベーススキーマ (今後追加)
├── tests/                    # テストファイル
├── doc/                      # ドキュメント
│   ├── API_SCHEME.md         # API仕様書
│   ├── ER_DIAGRAM.md         # ER図
│   ├── SCREEN_DESIGN.md      # 画面設計書
│   └── TEST_DEFINITION.md    # テスト仕様書
└── public/                   # 静的ファイル
```

## 🔧 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# TypeScript型チェック
npm run typecheck

# ESLintチェック
npm run lint

# ESLint自動修正
npm run lint:fix

# Prettierフォーマット
npm run format

# Prettierチェック
npm run format:check

# テスト実行
npm run test

# テスト（ウォッチモード）
npm run test:watch

# テストカバレッジ
npm run test:coverage
```

## 🎨 スタイルガイド

### Tailwindカスタムコンポーネント

プロジェクトでは以下のカスタムユーティリティクラスを定義しています：

- `.btn` - 基本ボタンスタイル
- `.btn-primary` - プライマリボタン
- `.btn-secondary` - セカンダリボタン
- `.btn-danger` - 削除・危険操作用ボタン
- `.input` - フォーム入力フィールド
- `.label` - フォームラベル
- `.card` - カードコンポーネント

## 🧪 テスト

```bash
# 単体テスト実行
npm run test

# カバレッジレポート生成
npm run test:coverage

# UIモードでテスト実行
npm run test:ui
```

## 📝 開発ガイドライン

### ブランチ戦略

- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `fix/*`: バグ修正
- `docs/*`: ドキュメント更新

### コミットメッセージ規約

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・設定変更
```

### Pull Requestフロー

1. featureブランチを作成
2. 変更を実装
3. テストを追加・実行
4. Pull Requestを作成
5. レビュー・承認
6. mainブランチへマージ

## 🚧 今後の実装予定

- [ ] Prismaデータベース設定 (Issue #2)
- [ ] shadcn/uiコンポーネント導入 (Issue #3)
- [ ] OpenAPI仕様定義 (Issue #4)
- [ ] JWT認証システム (Issue #5-7)
- [ ] 日報CRUD機能 (Issue #8-12)
- [ ] マスタ管理機能 (Issue #13-15)
- [ ] Google Cloud Runへのデプロイ (Issue #22-25)

## 📄 ライセンス

プライベートプロジェクト

## 👥 コントリビューター

- [@sutefu23](https://github.com/sutefu23)

## 📞 お問い合わせ

Issues: [GitHub Issues](https://github.com/sutefu23/daily-report/issues)
