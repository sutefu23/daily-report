#!/bin/bash

# 変更されたTS/TSXファイルを取得してフォーマット
files=$(git diff --name-only | grep -E '\.(ts|tsx)$' || true)

if [ -n "$files" ]; then
  echo "Formatting modified TypeScript files..."
  echo "$files" | xargs npx prettier --write 2>/dev/null || true
  echo "$files" | xargs npx eslint --fix 2>/dev/null || true
  echo "Formatting complete."
fi