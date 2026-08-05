# Development Instructions

Read this file when writing or changing code, tests, dependencies, repository documentation, or Superpowers specs/plans.

- Write Superpowers specs and plans in English.
- For code or behavior changes, follow red-green-refactor test-driven development.
- For documentation or configuration changes, run proportionate checks for syntax, references, and affected workflows instead of forcing a code-oriented TDD cycle.
- When a Node.js project contains `package-lock.json`, use `npm ci` to install dependencies. If it does not, follow the repository's documented package manager workflow and do not create or replace a lockfile without user authorization.
- When using Superpowers, do not commit spec or plan files.
- Run focused verification after each change and broaden it in proportion to the risk. Do not claim a fix or completion without fresh command output.
