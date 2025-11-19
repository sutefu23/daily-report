/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';
import 'vitest/globals';

declare global {
  namespace Vi {
    interface Assertion {
      toBeInTheDocument(): void;
      toHaveTextContent(text: string | RegExp): void;
      toHaveAttribute(attr: string, value?: string | RegExp): void;
      toBeVisible(): void;
      toBeDisabled(): void;
      toBeEnabled(): void;
      toHaveClass(className: string): void;
      toHaveStyle(style: Record<string, any>): void;
      toHaveValue(value: string | string[] | number): void;
    }
  }
}
