#!/bin/bash

# PostToolUseで編集されたファイルをフォーマット
# $CLAUDE_FILE_PATHSにはEdit/Write/MultiEditで編集されたファイルパスが入る

if [ -n "$CLAUDE_FILE_PATHS" ]; then
  # TS/TSXファイルのみをフィルタリング
  ts_files=$(echo "$CLAUDE_FILE_PATHS" | grep -E '\.(ts|tsx)$' || true)
  
  if [ -n "$ts_files" ]; then
    echo "Formatting edited TypeScript files..."
    
    # Prettierでフォーマット
    echo "$ts_files" | xargs npx prettier --write 2>/dev/null || true
    
    # ESLintで修正
    echo "$ts_files" | xargs npx eslint --fix 2>/dev/null || true
    
    echo "Formatting complete."
  fi
fi