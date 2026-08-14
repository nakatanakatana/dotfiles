# Git and GitHub Instructions

Read this file when running Git/GitHub commands, writing GitHub content, creating commits, opening or updating pull requests, or inspecting CI.

- Run all `git` and `gh` commands outside the sandbox.
- If Git commit signing fails, confirm how to proceed with the user.
- Write GitHub content in English.
- When using `gh api`, specify the method option (e.g., `-X` / `--method`) at the beginning of options if applicable.
- After creating or updating a pull request:
  - Start CI monitoring in the background and return without blocking.
  - Once notified of completion, fix in-scope failures or report results.
