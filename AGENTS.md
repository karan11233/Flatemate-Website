# Flatemate Website — Agent Operating Guidelines (AGENTS.md)

## Strict Operating Rules for Gemini / AI Assistant

All AI agents working on this project must strictly comply with the following instructions:

1. **Mandatory Step Before Coding**:
   - Always read `CHANGES.md` before making any modifications.
   - Review the latest *Reviewed Commit SHA*, *ChatGPT Review Findings*, and *Required Changes*.

2. **Scope Limitation**:
   - Only modify files that are explicitly authorized in the current review cycle or task prompt.
   - Never modify `B:\Flatemate` (the React Native mobile application).
   - Never modify `B:\Flatemate-Website\legacy-reference/`.
   - Preserve the approved website UI/UX, layouts, colors, and design parity at all times.

3. **Security Invariants**:
   - Never commit `.env`, credentials, API tokens, or secrets to Git.
   - Never connect to or execute migrations against a production database without explicit written approval.
   - Keep unverified guest claims and unverified file uploads disabled until their security tests pass.

4. **Task Completion & Recording**:
   - Record all completed work, modified files, test outputs, and implementation details in `CHANGES.md`.
   - Run typecheck, lint, and all test suites before committing.

5. **Stop for Review**:
   - After pushing code to the designated branch, stop immediately.
   - Output the repository URL, branch name, and commit SHA.
   - Wait for review and approval before proceeding to the next step.
