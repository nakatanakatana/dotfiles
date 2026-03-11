# Manual Maintenance Steps

If automated merging or rebasing fails due to permission or scope issues, follow these manual steps.

## How to Trigger a Rebase for Renovate

1.  **Direct GitHub Link (Recommended)**: 
    - Open the PR URL.
    - Find the "Rebasing" section in the PR description.
    - Check the box: `[ ] If you want to rebase/retry this PR, check this box`.

2.  **Using `gh` Command (If authorized)**:
    ```bash
    # Replace <PR_URL> with the actual PR URL
    gh pr edit <PR_URL> --body "$(gh pr view <PR_URL> --json body -q .body | sed 's/\[ \] <!-- rebase-check -->/\[x\] <!-- rebase-check -->/')"
    ```

## How to Set Auto-merge Manually

If you want the PR to merge automatically after CI passes:

1.  **Via GitHub UI**:
    - Open the PR.
    - Click the "Enable auto-merge" button in the merge box.

2.  **Via `gh` command**:
    ```bash
    gh pr merge <PR_URL> --auto --squash --delete-branch
    ```
