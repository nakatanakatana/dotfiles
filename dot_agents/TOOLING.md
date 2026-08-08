# Agent Tooling Registry

Use this registry to choose the most suitable coding agent or minimum set of agents that can complete the task safely. Keep detailed command syntax in the corresponding skill or CLI help; this file records when to use each agent and how to select its model.

## Selection rules

1. Prefer the simplest coding agent that satisfies the task. Read-only inspection or a one-command check stays in the caller pane; do not delegate it.
2. Choose based on scope and coupling, not only on estimated duration:
   - Small: one or two files, clear behavior, or read-only investigation. Work in the caller pane.
   - Medium: a bounded implementation, test, or review with a clear handoff. Use one delegated agent when delegation provides value, through Herdr when available and appropriate.
   - Large: multiple independently testable areas. Use multiple agents for disjoint work and run them in parallel, through Herdr when available and appropriate.
3. When delegating, prefer a coding agent or tool different from the caller's whenever practical. Reuse the same one only when task fit, availability, or operating constraints make it the better choice.
4. When using two or more agents simultaneously, arrange the additional panes with `split_horizontal` so the panes are side by side.
5. Remove the pane created for a delegated task when that task is complete.
6. Do not parallelize coupled edits, shared generated files, dependency changes, or operations that must observe an earlier result. Assign ownership before starting parallel work and integrate in the caller pane.
7. Every delegated task must state its scope, files or surfaces it owns, expected deliverable, verification command, and reporting format.
8. Prefer reversible, observable operations. Preserve the caller's focus and working directory, parse IDs from tool responses, and inspect results before integration.
9. Update this registry when a coding agent is added or removed, or when its model-selection or operating constraints change.

## Coding agent registry

| Coding agent | Best use | Task size / complexity | Model selection and constraints |
| --- | --- | --- | --- |
| agy | Independent implementation, analysis, or review using the agy coding agent | Medium to large; useful for a second implementation or review perspective | Inspect available models with `agy models` when model choice matters, then pass `--model <model>`. Keep permissions and sandbox mode explicit. |
| Cursor Agent (`agent`) | Focused implementation, test creation, code review, or repository investigation | Small to medium; useful for a bounded handoff | Prefer Cursor's Auto model selection: omit `--model` and let Auto choose the model. Specify a model only when a task-specific constraint requires it. Use `--workspace` or the current working directory deliberately. |
| OpenCode | Multi-step implementation, repository exploration, or review across configurable providers | Medium to large; useful when provider/model choice is important | Follow the OpenCode model-selection procedure below. Never rely on a stale hard-coded model list. |
| Codex | Planning, multi-file implementation, integration, and final review | Small to large; useful for coupled changes | When the caller is Codex, continue in the current session or use built-in Codex sub-agents; start another Codex through Herdr only when a separate pane or terminal lifecycle is needed. Use the model selected by the runtime and verify delegated changes independently. |

## OpenCode model selection

Before every OpenCode session or delegation:

1. Run `opencode models` and use the current output as the source of truth.
2. If the registry or command output does not explain a model sufficiently, search and confirm its capabilities using current provider documentation or available metadata before using it. Do not infer a model's suitability from its name alone.
3. Choose a listed `provider/model` that matches the task: a fast model for small edits or checks, a stronger reasoning model for complex or risky changes, and a larger-context model when the repository surface is broad.
4. Start OpenCode with the exact selected model, for example `opencode --model provider/model`, and include that selection in the handoff record.
5. If the model's capabilities cannot be confirmed or the required model is unavailable, select another known model from the current command output or report the limitation; do not invent a model identifier.
