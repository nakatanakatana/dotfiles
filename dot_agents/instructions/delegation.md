# Delegation and Parallelization Instructions

Read this file when delegating work, using Herdr, starting coding agents, or parallelizing tasks. Consult `$HOME/.agents/TOOLING.md` first to select the coding agent and model.

- When delegation to a different coding agent is useful and `HERDR_ENV=1`, prefer Herdr: split a sibling pane in the current tab, preserve the caller's working directory and focus, start the selected agent there, and delegate a bounded task with explicit inputs and outputs. Follow `$HOME/.agents/skills/herdr/SKILL.md` for all Herdr commands and safety rules.
- When the caller is Codex, keep Codex work in the current session or use built-in Codex sub-agents. Do not start another Codex through Herdr unless a separate pane, an independent terminal lifecycle, or user-visible interaction is specifically needed.
- Include the selected coding agent and model in the delegation prompt. Follow `$HOME/.agents/TOOLING.md` for agent-specific model discovery and selection.
- Match execution to task size and coupling: handle small, local changes directly; use one delegated agent for a bounded medium task; and use multiple agents for independent parts of a large task. Run independent work in parallel when it reduces latency, but assign clear file ownership and integrate coupled or shared-file changes sequentially.
- Do not split work merely for parallelism. Keep review, integration, and final verification in the caller pane, and inspect delegated output before applying it. If Herdr is unavailable or its prerequisites are not met, use the best available local tool or explain the limitation rather than bypassing its safety checks.

## Before delegation

- Confirm the task is bounded and independently verifiable.
- Select the coding agent and model from `$HOME/.agents/TOOLING.md`.
- Define file or surface ownership, dependencies, the expected deliverable, the verification command, and the reporting format.
- When using Herdr, choose a usable sibling-pane direction, preserve the current working directory, keep focus in the caller pane unless requested otherwise, and record returned pane and agent IDs.

## After delegation

- Read the agent result and inspect its changes in the caller pane.
- Run focused verification locally or in a dedicated verification pane.
- Integrate shared or coupled changes sequentially, then run final verification from the caller pane.
