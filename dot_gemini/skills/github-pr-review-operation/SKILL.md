---
name: github-pr-review-operation
description: Perform GitHub Pull Request operations including viewing PR info, diffs with line numbers, and fetching/posting review comments using the GitHub CLI (gh). Use when you need to audit, review, or interact with GitHub Pull Requests.
---

# GitHub PR Review Operation

This skill provides a set of workflows and commands for interacting with GitHub Pull Requests via the `gh` CLI.

## Prerequisites
- `gh` CLI installed and authenticated (`gh auth login`).

## Variable Mapping
Parse the PR URL `https://github.com/OWNER/REPO/pull/NUMBER`:
- `OWNER`: Repository owner
- `REPO`: Repository name
- `NUMBER`: PR number

## Operations

### 1. PR Info
Get basic information about the PR.
```bash
gh pr view NUMBER --repo OWNER/REPO --json title,body,author,state,baseRefName,headRefName,url
```

### 2. Diff with Line Numbers
Get the PR diff with side-aware line numbers.
```bash
gh pr diff NUMBER --repo OWNER/REPO | awk '
/^@@/ {
  match($0, /-([0-9]+)/, old); match($0, /\+([0-9]+)/, new);
  old_line = old[1]; new_line = new[1];
  print $0; next
}
/^-/ { printf "L%-4d     | %s\n", old_line++, $0; next }
/^\+/ { printf "     R%-4d| %s\n", new_line++, $0; next }
/^ / { printf "L%-4d R%-4d| %s\n", old_line++, new_line++, $0; next }
{ print }'
```
- `L<num>`: Base side line number (use `side=LEFT` for comments).
- `R<num>`: Head side line number (use `side=RIGHT` for comments).

### 3. Fetch Comments
Always use `--paginate` and `--method GET` with `-f sort=created -f direction=desc` for the latest comments.

**Global PR Comments:**
```bash
gh api repos/OWNER/REPO/issues/NUMBER/comments --paginate --method GET -f sort=created -f direction=desc --jq '.[] | {id, user: .user.login, created_at, body}'
```

**Inline Review Comments:**
```bash
gh api repos/OWNER/REPO/pulls/NUMBER/comments --paginate --method GET -f sort=created -f direction=desc --jq '.[] | {id, user: .user.login, path, line, created_at, body, in_reply_to_id}'
```

### 4. General Comment
```bash
gh pr comment NUMBER --repo OWNER/REPO --body "Your comment here"
```

### 5. Inline Review Comment
Get head commit SHA first: `gh api repos/OWNER/REPO/pulls/NUMBER --jq '.head.sha'`

```bash
gh api repos/OWNER/REPO/pulls/NUMBER/comments \
  --method POST \
  -f body="Comment text" \
  -f commit_id="COMMIT_SHA" \
  -f path="file/path.ts" \
  -F line=15 \
  -f side=RIGHT
```
*Note: Use `-F` for numeric params like `line` and `start_line`.*

### 6. Reply to Comment
```bash
gh api repos/OWNER/REPO/pulls/NUMBER/comments/COMMENT_ID/replies --method POST -f body="Reply text"
```
