---
name: github-pr-creator
description: Create a GitHub Pull Request with automated quality checks and summarized change descriptions. Use when you need to push a branch and open a PR after completing a task.
---

# GitHub PR Creator

This skill automates the process of pushing changes and creating a Pull Request (PR) on GitHub, ensuring code quality and providing clear descriptions.

## Prerequisites

- **GitHub CLI (`gh`)**: Must be installed and authenticated (`gh auth status`).
- **Git**: Current workspace must be a git repository.

## Workflow

### 1. Pre-push Quality Checks

Before pushing, analyze the scope of changes and run the appropriate linting and testing commands for the affected parts of the project.
- **Identify Scope**: Determine which parts of the codebase were modified (e.g., Frontend, Backend, or specific modules).
- **Run Relevant Checks**: Execute the project-specific lint and test commands applicable to the modified files. Infer the correct tools based on the file extensions and project structure (e.g., using `package.json` for JS/TS or `Makefile` for Go).
- **Halt** if any checks fail.

### 2. Prepare Change Summary

Summarize the changes in the current branch to generate a high-quality PR title and description.
- **Get Branch Name**: `git branch --show-current`.
- **Identify Base Branch**: Usually `main` or `master`.
- **Get Diff Summary**: `git diff <base_branch>..<current_branch> --stat`.
- **Analyze Changes**: Review the diff to identify key features, bug fixes, and refactorings.

### 3. Push and Create PR

- **Push Branch**: `git push origin <current_branch>`.
- **Generate PR Content**:
    - **Title**: A concise summary (e.g., `feat(items): optimize bulk mark as read`).
    - **Body**: A detailed description of "What" and "Why", including key changes and any verified improvements (e.g., performance metrics).
- **Create PR**:
  ```bash
  gh pr create --title "<title>" --body "<body>"
  ```

## Guidance for Descriptions

- **Be Precise**: Use technical terms accurately.
- **Focus on Impact**: Explain how the changes benefit the user or the system (e.g., "Reduced UI freeze from 7s to <1ms").
- **List Key Changes**: Use bullet points for readability.
