#!/bin/bash
# PR Review Health Check Script
# Usage: ./pr-review-check.sh --threads <pr> | --checks <pr> | --walkthrough <pr>

set -e

REPO="erxes/erxes"
AUTHOR="Amartuvshins0404"

usage() {
  echo "Usage: $0 [--threads <pr> | --checks <pr> | --walkthrough <pr>]"
  exit 1
}

# Count unanswered bot threads (author-engagement filter, not isResolved)
check_threads() {
  local pr=$1
  local count
  count=$(gh api graphql -f query='query($n:Int!){repository(owner:"erxes",name:"erxes"){pullRequest(number:$n){reviewThreads(first:100){nodes{id comments(first:50){nodes{author{login}}}}}}}}' -F n="$pr" \
    --jq --arg a "$AUTHOR" --arg rx "coderabbitai|sourcery-ai|github-advanced-security|sonarqubecloud|sonarcloud|kimi-review" '
      [
        .data.repository.pullRequest.reviewThreads.nodes[] |
        (.comments.nodes // []) as $cs |
        select(($cs | length) > 0) |
        select([$cs[].author.login] | any(test($rx))) |
        select([$cs[].author.login] | any(. == $a) | not)
      ] | length')
  
  if [ "$count" -eq 0 ]; then
    echo "PASS: Zero unanswered bot threads"
    return 0
  else
    echo "FAIL: $count unanswered bot thread(s)"
    return 1
  fi
}

# Check failing relevant checks (exclude known-flaky)
check_checks() {
  local pr=$1
  local failing
  failing=$(gh pr checks "$pr" --repo "$REPO" --json name,bucket 2>/dev/null \
    | jq '[.[] | select(.bucket=="fail") | select(.name | test("Analyze \(go\)|DeepSource: Error") | not)] | length')
  
  if [ "$failing" -eq 0 ]; then
    echo "PASS: Zero failing relevant checks"
    return 0
  else
    echo "FAIL: $failing failing check(s)"
    return 1
  fi
}

# Count walkthrough findings (Kimi, SonarCloud top-level comments)
check_walkthrough() {
  local pr=$1
  local total=0
  
  # Kimi / Claude Code Action via github-actions[bot]
  local kimi_body
  kimi_body=$(gh api "/repos/$REPO/issues/$pr/comments" \
    --jq '[.[] | select(.user.login=="github-actions[bot]")] | sort_by(.created_at) | last | .body // empty' 2>/dev/null)
  if [ -n "$kimi_body" ]; then
    local kimi_n
    kimi_n=$(echo "$kimi_body" | grep -oE 'found ([0-9]+) issues?' | grep -oE '[0-9]+' | head -1)
    [ -n "$kimi_n" ] && total=$((total + kimi_n))
  fi
  
  # SonarCloud
  local sonar_body
  sonar_body=$(gh api "/repos/$REPO/issues/$pr/comments" \
    --jq '[.[] | select(.user.login | test("sonarqubecloud|sonarcloud"))] | sort_by(.created_at) | last | .body // empty' 2>/dev/null)
  if [ -n "$sonar_body" ] && echo "$sonar_body" | grep -qE "Quality Gate (Failed|failed)"; then
    local sonar_n
    sonar_n=$(echo "$sonar_body" | grep -oE '\[([0-9]+) New issue' | grep -oE '[0-9]+' | head -1)
    [ -n "$sonar_n" ] && total=$((total + sonar_n))
  fi
  
  if [ "$total" -eq 0 ]; then
    echo "PASS: Zero walkthrough findings"
    return 0
  else
    echo "FAIL: $total walkthrough finding(s)"
    return 1
  fi
}

# Main
case "${1:-}" in
  --threads)
    [ -z "${2:-}" ] && usage
    check_threads "$2"
    ;;
  --checks)
    [ -z "${2:-}" ] && usage
    check_checks "$2"
    ;;
  --walkthrough)
    [ -z "${2:-}" ] && usage
    check_walkthrough "$2"
    ;;
  *)
    usage
    ;;
esac
