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
5. When using Herdr for delegation, keep the caller pane on the left. Create the first delegation pane by splitting the caller pane to the right. For each additional delegation, split an existing right-column delegation pane downward, so delegated panes stack vertically on the right. Preserve the caller's working directory and focus unless the user requests otherwise.
6. Each delegated task must define its scope, owned files or surfaces, deliverable, verification command, and report format.
7. Prefer reversible, observable operations. Preserve the caller's working context, parse IDs from tool responses, and inspect delegated results before integration.
8. Update this registry when agents or their model and operating constraints change.

## Default model policy

Use each agent's runtime default model unless the task has a specific model requirement. Do not run model discovery or pass `--model` for ordinary work. When an explicit model is necessary, follow the agent-specific guidance and the conditional procedure below.

## Coding agent registry

| Coding agent | Model selection and constraints |
| --- | --- |
| agy | Omit `--model` by default. If a specific model is required, run `agy models` to select one and pass `--model`. Set permissions and sandbox mode explicitly. |
| Cursor Agent (`agent`) | Omit `--model` by default (Auto mode) unless the task requires a specific model. Set the workspace deliberately. |
| OpenCode | Omit `--model` by default. If a specific model is required, follow the model selection procedure below. |
| Codex | If the caller is Codex, use the current session or a built-in sub-agent; otherwise delegate to Codex through Herdr. Create a separate pane only when needed. Use the runtime model by default. |

## Explicit model selection (only when required)

When a task requires specific speed, reasoning, or context length capabilities:

1. Run the agent's model listing command (e.g., `opencode models`, `agy models`) to check available models.
2. If capabilities are unclear, check current provider documentation or metadata; do not infer them from the name.
3. Pass the exact model with `--model` and record it in the handoff. If it is unavailable or unverified, choose a known alternative or report the limitation.
