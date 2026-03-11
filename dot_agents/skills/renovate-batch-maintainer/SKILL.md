---
name: renovate-batch-maintainer
description: Batch maintain Renovate PRs across repositories owned by the currently authenticated GitHub user. Lists, merges (squash), and sets auto-merge for Renovate-generated PRs with successful or pending CI.
---

# Renovate Batch Maintainer

This skill automates the workflow for maintaining multiple Renovate PRs for the current GitHub user.

## Workflow

1. **Identify User**: Determine the current GitHub username using `gh auth status`.
2. **Search**: Find open PRs created by the Renovate app in the current user's repositories.
3. **Review & Confirm**: 
    - List the found PRs grouped by repository.
    - Present the list to the user and **ask for confirmation** before proceeding with any merge or auto-merge actions.
4. **Execute (After Approval)**:
    - **Merge**: Perform squash merge and delete the branch for PRs with successful CI.
    - **Auto-merge**: Enable auto-merge for PRs with pending CI.
    - **Conflicts**: If a PR has conflicts (not mergeable), advise the user to trigger a rebase.

## Tool Commands

### Identify Current User
```bash
gh auth status
```

### Search for Renovate PRs
```bash
# Replace <USERNAME> with the name identified in step 1
gh search prs --owner <USERNAME> --app renovate --state open --json repository,title,url,number
```

### Check mergeability and CI status
```bash
gh pr view <PR_URL> --json mergeable,statusCheckRollup
```

### Merge (Squash & Delete Branch)
```bash
gh pr merge <PR_URL> --squash --delete-branch
```

### Enable Auto-merge
```bash
gh pr merge <PR_URL> --auto --squash --delete-branch
```

## Manual Intervention

If automated editing of PR body fails (due to scope issues), instruct the user to:
1. Open the PR URL.
2. Tick the "rebase/retry" checkbox in the PR description.
3. Alternatively, use the `gh` command provided in [manual-steps.md](references/manual-steps.md).
