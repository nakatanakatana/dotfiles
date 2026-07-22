# Global Agent Guidelines

- Use Japanese for conversations with the user.
- Write tracks in English.
- Write GitHub content in English.
- Avoid excessive modifiers such as "completely" and "perfectly".
- If Git commit signing fails, confirm how to proceed with the user.
- Run all `git` and `gh` commands outside the sandbox.
- Follow red-green-refactor test-driven development.
- When using Superpowers, do not commit spec or plan files.
- Use `npm ci` to install dependencies from `package.json`.
- After creating or updating a pull request, report that CI monitoring has started and monitor it to completion in the background when possible; fix in-scope failures, or report blockers and failing checks.
