# Agent Tooling Registry

Use this registry to choose the smallest set of coding agents that can complete the task safely. Only use the coding agent and model combinations specified in this registry. Keep command details in the relevant skill or CLI help.

## Selection rules

1. Only use the coding agent and model combinations explicitly defined in this registry. Do not use unlisted tools or models.
2. Match delegation to scope and coupling:
   - Small: one or two files, clear behavior, read-only investigation, or a one-command check. Work in the caller pane.
   - Medium: bounded implementation, testing, or review. Delegate to one agent through Herdr when useful.
   - Large: independent, testable areas. Assign ownership and parallelize disjoint work through Herdr when appropriate.
3. Do not parallelize coupled edits, shared generated files, dependency changes, or sequential operations. Integrate results in the caller pane.
4. Prefer a different agent or tool from the caller. Before reusing the same tool, compare it with a simple sub-agent; reuse it only when task fit, availability, or constraints justify it.
5. Spread usage across available tools and models in the registry. Do not use a rate-limited option until its limit resets.
6. When using Herdr for delegation, keep the caller pane on the left. Create the first delegation pane by splitting the caller pane to the right. For each additional delegation, split an existing right-column delegation pane downward, so delegated panes stack vertically on the right. Preserve the caller's working directory and focus unless the user requests otherwise.
7. Each delegated task must define its scope, owned files or surfaces, deliverable, verification command, and report format.
8. Prefer reversible, observable operations. Preserve the caller's working context, parse IDs from tool responses, and inspect delegated results before integration.
9. Update this registry when agents or their model and operating constraints change.

## Coding agent and model registry

Only the following tool and model combinations are allowed:

| Coding agent | Model specification | Invocation and constraints |
| --- | --- | --- |
| agy | No model specified (runtime default) | Omit `--model`. Set permissions and sandbox mode explicitly. |
| Cursor Agent (`agent`) | No model specified (auto) | Omit `--model` (Auto mode). Set the workspace deliberately. |
| OpenCode | `opencode-go/deepseek-v4-flash` | Pass `--model opencode-go/deepseek-v4-flash` explicitly. |
| OpenCode | `opencode-go/muse-spark-1.2-contributor` | Pass `--model opencode-go/muse-spark-1.2-contributor` explicitly. |

## Model policy and invocation rules

- **agy**: Omit `--model` to use the runtime default model. Do not pass an explicit model.
- **Cursor Agent (`agent`)**: Omit `--model` to use Auto mode. Do not pass an explicit model.
- **OpenCode**: Always explicitly specify one of the two permitted models (`opencode-go/deepseek-v4-flash` or `opencode-go/muse-spark-1.2-contributor`) via `--model <model>`. Do not omit `--model` and do not select any unlisted model.
- **Strict enforcement**: Only use the combinations listed above. Do not run model discovery or switch to unlisted models unless explicitly instructed by the user.
