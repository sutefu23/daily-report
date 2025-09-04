import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export class PasswordUtil {
  /**
   * パスワードをハッシュ化する
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * パスワードを検証する
   */
  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * パスワードの強度を検証する
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('パスワードは8文字以上である必要があります');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('パスワードには大文字を含む必要があります');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('パスワードには小文字を含む必要があります');
    }

    if (!/\d/.test(password)) {
      errors.push('パスワードには数字を含む必要があります');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
