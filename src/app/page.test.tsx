import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', {
      level: 1,
      name: /営業日報システム/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<Home />);
    const description = screen.getByText(
      /営業担当者が日々の活動を報告し、上長がフィードバックを行うためのシステムです/i
    );
    expect(description).toBeInTheDocument();
  });

  it('renders all navigation cards', () => {
    render(<Home />);

    // クイックスタートカード
    const quickStartCard = screen.getByRole('heading', {
      name: /🚀 クイックスタート/i,
    });
    expect(quickStartCard).toBeInTheDocument();

    // 日報管理カード
    const reportCard = screen.getByRole('heading', { name: /📊 日報管理/i });
    expect(reportCard).toBeInTheDocument();

    // 顧客管理カード
    const customerCard = screen.getByRole('heading', { name: /👥 顧客管理/i });
    expect(customerCard).toBeInTheDocument();

    // 営業担当者管理カード
    const salesPersonsCard = screen.getByRole('heading', {
      name: /👥 営業担当者管理/i,
    });
    expect(salesPersonsCard).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Home />);

    // ログインリンク
    const loginLink = screen.getByRole('link', { name: /ログインページへ/i });
    expect(loginLink).toHaveAttribute('href', '/login');

    // 日報一覧リンク
    const reportsLink = screen.getByRole('link', { name: /日報一覧へ/i });
    expect(reportsLink).toHaveAttribute('href', '/reports');

    // 顧客管理リンク
    const customersLink = screen.getByRole('link', { name: /顧客管理へ/i });
    expect(customersLink).toHaveAttribute('href', '/customers');

    // 営業担当者管理リンク
    const salesPersonsLink = screen.getByRole('link', {
      name: /営業担当者管理へ/i,
    });
    expect(salesPersonsLink).toHaveAttribute('href', '/sales-persons');
  });

  it('renders the footer copyright', () => {
    render(<Home />);
    const copyright = screen.getByText(
      /© 2025 営業日報システム. All rights reserved./i
    );
    expect(copyright).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    render(<Home />);

    // ボタンのクラスチェック
    const loginButton = screen.getByRole('link', { name: /ログインページへ/i });
    expect(loginButton).toHaveClass('btn-primary');

    const reportsButton = screen.getByRole('link', { name: /日報一覧へ/i });
    expect(reportsButton).toHaveClass('btn-secondary');
  });
});
