# Agent Tooling Registry

Use this registry to choose the smallest set of coding agents that can complete the task safely. Keep command details in the relevant skill or CLI help.

## Selection rules

1. Match delegation to scope and coupling:
   - Small: one or two files, clear behavior, read-only investigation, or a one-command check. Work in the caller pane.
   - Medium: bounded implementation, testing, or review. Delegate to one agent through Herdr when useful.
   - Large: independent, testable areas. Assign ownership and parallelize disjoint work through Herdr when appropriate.
2. Do not parallelize coupled edits, shared generated files, dependency changes, or sequential operations. Integrate results in the caller pane.
3. Prefer a different agent or tool from the caller. Before reusing the same tool, compare it with a simple sub-agent; reuse it only when task fit, availability, or constraints justify it.
4. Spread usage across tools and, for OpenCode, providers. Do not use a rate-limited option until its limit resets.
5. When running agents in parallel, split the pane of the currently delegating agent using `split_horizontal` for each new agent. Remove each pane when its task finishes.
6. Each delegated task must define its scope, owned files or surfaces, deliverable, verification command, and report format.
7. Prefer reversible, observable operations. Preserve the caller's working context, parse IDs from tool responses, and inspect delegated results before integration.
8. Update this registry when agents or their model and operating constraints change.

## Coding agent registry

| Coding agent | Best use | Task size / complexity | Model selection and constraints |
| --- | --- | --- | --- |
| agy | Independent implementation, analysis, or review | Medium to large | Run `agy models`, pass a suitable `--model`, and set permissions and sandbox mode explicitly. |
| Cursor Agent (`agent`) | Focused implementation, tests, review, or investigation | Small to medium | Use Auto by omitting `--model` unless the task requires a specific model. Set the workspace deliberately. |
| OpenCode | Multi-step implementation, exploration, or review | Medium to large | Follow the model-selection procedure below. |
| Codex | Planning, coupled or multi-file work, integration, and final review | Small to large | If the caller is Codex, use the current session or a built-in sub-agent; otherwise delegate to Codex through Herdr. Create a separate pane only when needed. Use the runtime model and verify delegated work. |

## OpenCode model selection

Before every OpenCode session or delegation:

1. Run `opencode models` before each session and choose an available `provider/model` for the task's speed, reasoning, and context needs.
2. If its capabilities are unclear, check current provider documentation or metadata; do not infer them from the name.
3. Pass the exact model with `--model` and record it in the handoff. If it is unavailable or unverified, choose a known alternative or report the limitation.
