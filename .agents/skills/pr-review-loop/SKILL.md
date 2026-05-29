---
name: pr-review-loop
description: Post-commit PR review automation. After every commit to a PR, poll for AI reviewer comments (CodeRabbit, Sourcery, Claude Code Action, Kimi, SonarCloud), address every actionable item, wait for CI checks to pass, and loop until zero open comments and all checks green. Only then is the task considered done.
---

# Skill: PR Review Loop

## When to Use

Invoke this skill after EVERY commit to a PR, or when the user says:
- "address PR reviews"
- "fix AI reviewer comments"
- "clean up PR"
- "make sure no comments are left"

## Workflow

### Phase 1 — Wait for CI and Async Reviewers

```bash
# 1. Wait for all GitHub Actions checks to complete
gh pr checks <pr> --repo erxes/erxes --json name,bucket
# Poll until no check has bucket="pending"

# 2. Buffer for async AI reviewers (CodeRabbit, Sourcery post 2-5 min after checks finish)
sleep 180

# 3. Poll inline-comment count until stable across 2 consecutive 60s polls
# Stability means: same comment count on two consecutive polls
```

**Why:** AI reviewers (CodeRabbit, Sourcery, Claude Code Action) post asynchronously after `pull_request.synchronize`. Reading comments immediately after push will miss late-arriving reviews.

### Phase 2 — Fetch Full Review State

Gather these four data sources:

1. **Inline comments** (`gh api /repos/erxes/erxes/pulls/<pr>/comments`) — file:line level
2. **Review summaries** (`gh api /repos/erxes/erxes/pulls/<pr>/reviews`) — top-level approvals/requests
3. **Issue/walkthrough comments** (`gh api /repos/erxes/erxes/issues/<pr>/comments`) — Kimi, SonarCloud, Claude Code Action overview
4. **Unanswered bot threads** — the TRUE actionable signal (see Lesson below)

### Phase 3 — Triage Every Unresolved Item

Classify each comment by reviewer + body markers:

| Reviewer | Body marker | Action |
|---|---|---|
| `coderabbitai[bot]` | `_⚠️ Potential issue_` `_🟠 Major_` / `_🔴 Blocker_` | **Fix** |
| `coderabbitai[bot]` | `_💭 Style_` / `_📝 Documentation_` | **Reply only** |
| `sourcery-ai[bot]` | `**suggestion (security):**` / `**issue:**` | **Fix** |
| `sourcery-ai[bot]` | `**suggestion (style):**` | **Reply only** |
| `github-actions[bot]` | concern flagged | Cross-check inline; reply on walkthrough |
| `github-advanced-security[bot]` | any inline comment | **P0 — regression. Fix immediately** |
| `sonarqubecloud[bot]` | "Quality Gate Failed" with new BLOCKER | **Fix** |
| Any reviewer | "while you're in here, fix this other thing" | **Reply**: "out of scope" |

**Critical Lesson — Author-Engagement is the Truth:**

Do NOT trust `isResolved` or `isOutdated`. GitHub auto-resolves threads when later commits move line numbers, hiding genuinely unaddressed AI findings. The correct rule:

> "The thread has at least one reviewer-bot comment AND the PR author has NEVER posted in the thread" → actionable.

GraphQL query for unanswered threads:
```graphql
query($n:Int!){
  repository(owner:"erxes",name:"erxes"){
    pullRequest(number:$n){
      reviewThreads(first:100){
        nodes{
          id
          comments(first:50){
            nodes{
              author{login}
              body
            }
          }
        }
      }
    }
  }
}
```

Filter: at least one comment from `coderabbitai|sourcery-ai|github-advanced-security|sonarqubecloud|sonarcloud|kimi-review`, AND no comment from PR author.

### Phase 4 — Apply Fixes (Consolidated Commit)

For every triage entry with action="fix":
1. Read the file at path:line, understand the comment
2. Apply the minimum fix via Edit
3. Run `pnpm nx affected:build --base=origin/main` and `pnpm nx affected:lint --base=origin/main`
4. If build/lint fails → revert that fix, retry or downgrade to reply

Commit all fixes as ONE consolidated commit:
```bash
git add <changed-files>
git commit -m "fix: address PR #<pr> review (round <n>)

- <path>:<line> — <reviewer> — <action>: <rationale>"
git push
```

**Why one commit:** Prevents the race condition where fix Sourcery → push → CodeRabbit re-reviews mid-flight → posts overlapping comments.

### Phase 5 — Post Replies

For action="reply" items:
- Inline threads: `gh api -X POST /repos/erxes/erxes/pulls/<pr>/comments/<id>/replies`
- Top-level walkthrough: `gh pr comment <pr> --repo erxes/erxes --body "..."`

Reply template: `Noted — out of scope for this PR.` or `False positive: <one-line reason>.`

### Phase 6 — Verify and Loop

After push + replies, re-fetch the full review state. The PR is **SETTLED** only when ALL of:
1. Zero unanswered bot threads (author-engagement filter)
2. Zero failing relevant checks (excluding known-flaky: `Analyze (go)`, `DeepSource: Error`)
3. Zero walkthrough findings (Kimi, SonarCloud top-level comments)
4. Comment count stable across 2 consecutive polls
5. Working tree clean (`git status --porcelain` empty)

If any condition fails → increment round counter and loop (up to `round_cap`, default 5).

If round cap reached without settling → write `/tmp/BLOCKED-pr-<num>.md` with unresolved state and stop.

## Stop Conditions

| Condition | Action |
|---|---|
| All reviews settled + CI green | Task done |
| Round cap reached (default 5) | Write blocker report, stop |
| Merge conflict detected | Write blocker report, stop (don't auto-rebase) |
| GAS regression introduced | P0 — fix regression first, then loop |

## Self-Evaluation Checklist

Run after every round:
- [ ] Zero unanswered bot threads (author-engagement filter)
- [ ] Zero walkthrough findings (Kimi/SonarCloud top-level)
- [ ] All relevant checks green
- [ ] Zero GAS regressions
- [ ] Comment count stable (2 consecutive polls)
- [ ] Build + lint pass locally
- [ ] Working tree clean
- [ ] No Anthropic branding in commits or comments

### Final Exit Evaluation

Before declaring the PR "done", run one final comprehensive check:

```bash
# Returns 0 only if ALL conditions pass
.agents/scripts/pr-review-check.sh --final <pr_number>
```

This verifies:
1. **Zero open issues** — no unresolved review threads from any bot
2. **All CI green** — every check passing (excluding known-flaky)
3. **Zero walkthrough findings** — Kimi/SonarCloud report clean
4. **No GAS regressions** — no new security alerts

If any condition fails:
- **DO NOT** declare the task done
- **DO** continue to next round (if under round cap)
- **DO** report blocker to user in ≤20 words, e.g.:
  - "Blocked: 3 unresolved CodeRabbit comments."
  - "Blocked: CI check `payment_ui-ci` failing."
  - "Blocked: SonarCloud quality gate failed."
  - "Blocked: 2 GAS regressions need fixing."

## Critical Rules

1. **Wait for checks BEFORE reading reviews.** Always poll `gh pr checks` until complete, sleep 180s buffer, THEN read comments.
2. **One consolidated commit per round.** Never one commit per reviewer.
3. **Author-engagement > isResolved.** GitHub auto-resolves on outdated lines. Use the bot-presence + author-absence filter.
4. **Triage before fixing.** Not every comment needs a code change. Style/docs get replies.
5. **No scope creep.** If a reviewer says "while you're in here...", reply "out of scope" and move on.
6. **No Anthropic branding.** Strip `Co-Authored-By: Claude...` and "Generated with Claude Code" from all commits and comments.
7. **Round cap = 5.** If not settled after 5 rounds, the fix approach is wrong. Stop and report.
