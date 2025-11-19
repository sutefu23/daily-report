import { test, expect } from '@playwright/test';

test.describe('ログイン機能', () => {
  test('正常なログイン', async ({ page }) => {
    // ログインページへアクセス
    await page.goto('http://localhost:3000/login');

    // ページが正しく表示されているか確認
    await expect(page).toHaveTitle(/営業日報システム/);

    // メールアドレスとパスワードを入力
    await page.fill('input[name="email"]', 'yamada@example.com');
    await page.fill('input[name="password"]', 'password123');

    // ログインボタンをクリック
    await page.click('button[type="submit"]');

    // ログイン後のリダイレクトを待つ
    await page.waitForURL('http://localhost:3000/reports', { timeout: 10000 });

    // ログイン成功後、日報一覧ページに遷移していることを確認
    await expect(page).toHaveURL('http://localhost:3000/reports');
  });

  test('ログイン画面の表示確認', async ({ page }) => {
    // ログインページへアクセス
    await page.goto('http://localhost:3000/login');

    // 必要な要素が表示されているか確認
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // ラベルテキストの確認
    await expect(page.getByText('メールアドレス')).toBeVisible();
    await expect(page.getByText('パスワード')).toBeVisible();
  });

  test('エラーメッセージの表示確認', async ({ page }) => {
    // ログインページへアクセス
    await page.goto('http://localhost:3000/login');

    // 間違った認証情報を入力
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // ログインボタンをクリック
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されることを確認
    await expect(
      page.getByText(/メールアドレスまたはパスワードが正しくありません/)
    ).toBeVisible({ timeout: 5000 });
  });
});
