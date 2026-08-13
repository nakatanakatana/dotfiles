# Delegation and Parallelization Instructions

Read this file when delegating work, using Herdr, starting coding agents, or parallelizing tasks. Consult `$HOME/.agents/TOOLING.md` first to select the coding agent and determine whether the task needs an explicit model.

- When delegation to a different coding agent is useful and `HERDR_ENV=1`, prefer Herdr: split a sibling pane in the current tab, preserve the caller's working directory and focus, start the selected agent there, and delegate a bounded task with explicit inputs and outputs. Follow `$HOME/.agents/skills/herdr/SKILL.md` for all Herdr commands and safety rules.
- When the caller is Codex, keep Codex work in the current session or use built-in Codex sub-agents. Do not start another Codex through Herdr unless a separate pane, an independent terminal lifecycle, or user-visible interaction is specifically needed.
- Include the selected coding agent in the delegation prompt. Include the explicit model only when one was selected; otherwise state that the runtime default model is being used. Follow `$HOME/.agents/TOOLING.md` for agent-specific model discovery and selection when required.
- Match execution to task size and coupling: handle small, local changes directly; use one delegated agent for a bounded medium task; and use multiple agents for independent parts of a large task. Run independent work in parallel when it reduces latency, but assign clear file ownership and integrate coupled or shared-file changes sequentially.
- When using Herdr for delegation, keep the caller pane on the left. Create the first delegation pane by splitting the caller pane to the right. For each additional delegation, split an existing right-column delegation pane downward, so delegated panes stack vertically on the right. Preserve the caller's working directory and focus unless the user requests otherwise.
- Do not split work merely for parallelism. Keep review, integration, and final verification in the caller pane, and inspect delegated output before applying it. If Herdr is unavailable or its prerequisites are not met, use the best available local tool or explain the limitation rather than bypassing its safety checks.

## Before delegation

- Confirm the task is bounded and independently verifiable.
- Select the coding agent from `$HOME/.agents/TOOLING.md`. Select and record an explicit model only when the task requires one; otherwise use and record the runtime default.
- Define file or surface ownership, dependencies, the expected deliverable, the verification command, and the reporting format.
- When using Herdr, create the first delegation pane by splitting right from the caller pane; for each additional delegation, split down from an existing right-column delegation pane. Target panes explicitly, preserve the caller's working directory, keep focus in the caller pane unless requested otherwise, and record returned pane and agent IDs.

## After delegation

- Read the agent result and inspect its changes in the caller pane.
- Run focused verification locally or in a dedicated verification pane.
- Integrate shared or coupled changes sequentially, then run final verification from the caller pane.
