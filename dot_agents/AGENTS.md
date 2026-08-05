# Global Agent Guidelines

- Use Japanese for conversations with the user.
- Avoid excessive modifiers such as "completely" and "perfectly".
- Read the task-specific instructions below when their trigger applies; those files are part of the task contract.

## Conditional instructions

| Trigger | Read |
| --- | --- |
| Writing or changing code, tests, dependencies, repository documentation, or Superpowers specs/plans | `$HOME/.agents/instructions/development.md` |
| Running Git/GitHub commands, writing GitHub content, creating commits, opening or updating PRs, or inspecting CI | `$HOME/.agents/instructions/git-github.md` |
| Delegating work, starting coding agents, or parallelizing tasks | `$HOME/.agents/instructions/delegation.md` |
| Using or controlling Herdr | `$HOME/.agents/instructions/delegation.md` and `$HOME/.agents/skills/herdr/SKILL.md` |
| Choosing among tools or adding/removing a tool | `$HOME/.agents/TOOLING.md` |
