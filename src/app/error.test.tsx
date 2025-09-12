/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ErrorBoundary from './error';

describe('Error Component', () => {
  const mockReset = vi.fn();
  const mockError = new Error('Test error message') as Error & {
    digest?: string;
  };
  
  // console.errorをモック - 各テストの前に設定
  let consoleErrorSpy: any;
  
  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  it('renders error heading', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    // h1は"500"、h2が"エラーが発生しました"
    const statusHeading = screen.getByRole('heading', {
      level: 1,
      name: /500/i,
    });
    expect(statusHeading).toBeInTheDocument();
    
    const errorHeading = screen.getByRole('heading', {
      level: 2,
      name: /エラーが発生しました/i,
    });
    expect(errorHeading).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    // メッセージは一つのp要素内に含まれている
    const message = screen.getByText(
      /申し訳ございません。予期しないエラーが発生しました。/i
    );
    expect(message).toBeInTheDocument();
    expect(message.textContent).toContain('問題が解決しない場合はシステム管理者にお問い合わせください');
  });

  it('logs error to console', async () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    
    // Wait for useEffect to run
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Application error:',
        mockError
      );
    });
  });

  it('calls reset function when retry button is clicked', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    const retryButton = screen.getByRole('button', { name: /もう一度試す/i });

    fireEvent.click(retryButton);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('renders home link', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    const homeLink = screen.getByRole('link', { name: /ホームへ戻る/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('has proper button elements', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);

    const retryButton = screen.getByRole('button', { name: /もう一度試す/i });
    expect(retryButton).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: /ホームへ戻る/i });
    expect(homeLink).toBeInTheDocument();
  });

  it('handles error with digest property', async () => {
    const errorWithDigest = {
      ...mockError,
      digest: 'test-digest-123',
    } as Error & { digest?: string };

    render(<ErrorBoundary error={errorWithDigest} reset={mockReset} />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Application error:',
        errorWithDigest
      );
    });
  });
});
