#!/bin/bash

# すべてのissue-* worktreeを削除するスクリプト
# 手動実行またはStopフックで実行

# ログファイル
log_file="/Users/hirakawa/daily-report/.claude/cleanup-worktree.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] SubagentStop hook triggered" >> "$log_file"

project_root="/Users/hirakawa/daily-report"
cd "$project_root"

# git worktreeのリストから issue-* パターンのディレクトリを探す
worktrees=$(git worktree list --porcelain 2>/dev/null | grep "^worktree " | cut -d' ' -f2)

found_any=false
for worktree_path in $worktrees; do
  dir_name=$(basename "$worktree_path")
  
  # issue-*パターンにマッチする場合
  if [[ "$dir_name" =~ ^issue- ]]; then
    echo "Found worktree: $dir_name at $worktree_path"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Found worktree: $dir_name" >> "$log_file"
    found_any=true
    
    # worktreeを削除
    echo "Removing worktree: $dir_name"
    git worktree remove "$worktree_path" --force 2>/dev/null || git worktree remove "$worktree_path"
    
    # ディレクトリが残っていれば削除
    if [ -d "$worktree_path" ]; then
      rm -rf "$worktree_path"
    fi
    
    echo "Worktree $dir_name has been removed."
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Removed worktree: $dir_name" >> "$log_file"
  fi
done

if [ "$found_any" = false ]; then
  echo "No issue-* worktrees found."
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] No issue-* worktrees found" >> "$log_file"
fi