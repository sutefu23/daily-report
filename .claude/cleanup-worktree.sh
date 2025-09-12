#!/bin/bash

# Bashコマンドがgh pr createだった場合、worktreeを削除
if echo "$CLAUDE_TOOL_INPUT" | jq -r '.command' 2>/dev/null | grep -q "gh pr create"; then
  echo "PR created, checking for worktree to remove..."
  
  # プロジェクトのルートディレクトリを取得
  project_root="/Users/hirakawa/daily-report"
  
  # git worktreeのリストから issue-* パターンのディレクトリを探す
  cd "$project_root"
  worktrees=$(git worktree list --porcelain | grep "^worktree " | cut -d' ' -f2)
  
  for worktree_path in $worktrees; do
    dir_name=$(basename "$worktree_path")
    
    # issue-*パターンにマッチする場合
    if [[ "$dir_name" =~ ^issue- ]]; then
      echo "Found worktree: $dir_name at $worktree_path"
      
      # worktreeを削除
      echo "Removing worktree: $dir_name"
      git worktree remove "$worktree_path" --force 2>/dev/null || git worktree remove "$worktree_path"
      
      echo "Worktree $dir_name has been removed."
    fi
  done
fi