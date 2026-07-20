# Global Agent Guidelines

- Use Japanese for conversations with the user.
- Write tracks in English.
- Write GitHub content in English.
- Avoid excessive modifiers such as "completely" and "perfectly".
- If Git commit signing fails, confirm how to proceed with the user.
- Follow red-green-refactor test-driven development.
- Use `npm ci` to install dependencies from `package.json`.
- After creating or updating a pull request, monitor all CI checks until they reach a terminal state. Do not report the pull request as complete while checks are pending or failing. If a check fails, inspect its logs, fix failures within the requested scope, push the fix, and confirm that CI passes. If the failure cannot be resolved within scope, report the blocker and failing check.
