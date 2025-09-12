#!/bin/bash

# SubagentStop時に実行されるクリーンアップスクリプト
# issue-* パターンのworktreeで、PRが作成済みのものを削除

project_root="/Users/hirakawa/daily-report"
cd "$project_root"

echo "[SubagentStop] Checking for worktrees to clean up..."

# git worktreeのリストから issue-* パターンのディレクトリを探す
worktrees=$(git worktree list --porcelain 2>/dev/null | grep "^worktree " | cut -d' ' -f2)

for worktree_path in $worktrees; do
  dir_name=$(basename "$worktree_path")
  
  # issue-*パターンにマッチする場合
  if [[ "$dir_name" =~ ^issue- ]]; then
    # そのworktreeのブランチ名を取得
    cd "$worktree_path" 2>/dev/null
    if [ $? -eq 0 ]; then
      branch_name=$(git branch --show-current)
      
      # リモートにプッシュ済みかチェック（PRが作成されている可能性が高い）
      if git ls-remote --exit-code --heads origin "$branch_name" >/dev/null 2>&1; then
        echo "[SubagentStop] Found pushed worktree: $dir_name (branch: $branch_name)"
        
        # プロジェクトルートに戻る
        cd "$project_root"
        
        # worktreeを削除
        echo "[SubagentStop] Removing worktree: $dir_name"
        git worktree remove "$worktree_path" --force 2>/dev/null || git worktree remove "$worktree_path"
        
        # ディレクトリが残っていれば削除
        if [ -d "$worktree_path" ]; then
          rm -rf "$worktree_path"
        fi
        
        echo "[SubagentStop] Worktree $dir_name has been removed."
      else
        echo "[SubagentStop] Worktree $dir_name exists but branch not pushed yet, keeping it."
        cd "$project_root"
      fi
    fi
  fi
done

echo "[SubagentStop] Cleanup check completed."