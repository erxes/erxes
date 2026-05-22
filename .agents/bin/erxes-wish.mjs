#!/usr/bin/env node
// erxes-wish — tool-agnostic prompt enhancer for .agents/-driven feature wishes.
//
// Usage (run from anywhere in the monorepo):
//   pnpm --silent erxes-wish "add a riskLevel field to deals"
//   pnpm --silent erxes-wish "add a riskLevel field to deals" | pbcopy
//   pnpm --silent erxes-wish --list                 # dashboard of in-flight wishes
//   pnpm --silent erxes-wish --show <wish-id>       # detail view of one wish
//   pnpm --silent erxes-wish --help
//
// Stdout: a complete tool-agnostic prompt to paste into any AI tool.
// Stderr: a one-block status summary (always shown, even when piping stdout).
//
// Full developer guide: .agents/docs/erxes-wish.md

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..', '..');
const AGENTS = resolve(REPO_ROOT, '.agents');
const WISHES = resolve(AGENTS, 'wishes');

const PHASE_ARTIFACTS = [
  { artifact: 'WISH.md',   phase: '0 WISH',    label: 'captured' },
  { artifact: 'SPEC.md',   phase: '2 SPEC',    label: 'drafted' },
  { artifact: 'GROUND.md', phase: '3 GROUND',  label: 'mapped' },
  { artifact: 'PLAN.md',   phase: '4 PLAN',    label: 'planned' },
  { artifact: 'REVIEW.md', phase: '7 REVIEW',  label: 'shipped' },
];

// ---------- pretty stderr helpers ----------

const RULE_LEN = 60;
const rule = (label = '') => {
  if (!label) return '─'.repeat(RULE_LEN);
  const padded = ` ${label} `;
  const left = 3;
  const right = Math.max(3, RULE_LEN - left - padded.length);
  return '─'.repeat(left) + padded + '─'.repeat(right);
};
const log = (...parts) => process.stderr.write(parts.join('') + '\n');

// ---------- CLI parsing ----------

const args = process.argv.slice(2);

function showHelp() {
  process.stderr.write(`erxes-wish — tool-agnostic prompt enhancer for .agents/

Usage (from anywhere in the monorepo):
  pnpm --silent erxes-wish "<wish>"                     assemble briefing to stdout
  pnpm --silent erxes-wish "<wish>" | pbcopy            copy briefing to clipboard
  pnpm --silent erxes-wish --list                       dashboard of in-flight wishes
  pnpm --silent erxes-wish --show <wish-id>             detail view of one wish
  pnpm --silent erxes-wish --help                       this help

Flags for briefing assembly:
  --no-lessons               skip embedding lessons.md (smaller prompt)
  --no-system-prompt         skip embedding SYSTEM-PROMPT.md (smallest)
  --skill <skill-name>       force a specific skill (override detection)

Stderr status is always shown (safe to pipe stdout).

Examples:
  pnpm --silent erxes-wish "add a riskLevel field to deals" | pbcopy
  pnpm --silent erxes-wish "show win-rate dashboard" --skill add-sales-ui-page
  pnpm --silent erxes-wish --list
  pnpm --silent erxes-wish --show 2026-05-22-deal-risk-level

Full guide: .agents/docs/erxes-wish.md
`);
}

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(args.length === 0 ? 2 : 0);
}

// ---------- Subcommands ----------

if (args[0] === '--list' || args[0] === '--status') {
  printWishList();
  process.exit(0);
}

if (args[0] === '--show') {
  const id = args[1];
  if (!id) {
    process.stderr.write('erxes-wish --show: missing <wish-id>\n');
    process.exit(2);
  }
  printWishDetail(id);
  process.exit(0);
}

// ---------- Briefing assembly mode ----------

const opts = {
  noLessons: args.includes('--no-lessons'),
  noSystemPrompt: args.includes('--no-system-prompt'),
  forcedSkill: null,
};

const skillIdx = args.indexOf('--skill');
if (skillIdx !== -1 && args[skillIdx + 1]) {
  opts.forcedSkill = args[skillIdx + 1];
}

const wish = args.filter((a, i) => {
  if (a.startsWith('--')) return false;
  if (i > 0 && args[i - 1] === '--skill') return false;
  return true;
}).join(' ').trim();

if (!wish) {
  process.stderr.write('erxes-wish: missing <wish> text\n');
  process.exit(2);
}

// ---------- Plugin scope detection ----------

const PLUGIN_KEYWORDS = {
  sales: [
    'sale', 'sales', 'deal', 'deals', 'pipeline', 'pipelines', 'stage', 'stages',
    'board', 'boards', 'kanban', 'checklist', 'pos', 'order', 'orders', 'cover',
    'ecommerce', 'wishlist', 'product review', 'last viewed',
  ],
  operation: ['task', 'tasks', 'project', 'projects', 'milestone', 'cycle', 'team'],
  frontline: ['conversation', 'ticket', 'inbox', 'chat', 'message'],
  accounting: ['accounting', 'invoice', 'ledger', 'journal'],
  payment: ['payment', 'invoice', 'transaction', 'qpay', 'qr code'],
  content: ['cms', 'article', 'post', 'page'],
  insurance: ['insurance', 'policy', 'claim'],
  loyalty: ['loyalty', 'voucher', 'spin', 'donate'],
  tourism: ['tourism', 'tour', 'booking'],
  mongolian: ['mongolian'],
};

// Returns Array<{ plugin, matchedKeyword }> for transparency.
function detectPlugin(text) {
  const lower = text.toLowerCase();
  const matches = [];
  for (const [plugin, keywords] of Object.entries(PLUGIN_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        matches.push({ plugin, matchedKeyword: kw });
        break;
      }
    }
  }
  return matches;
}

const detectedPlugins = detectPlugin(wish);
const primaryMatch = detectedPlugins[0] ?? null;
const primaryPlugin = primaryMatch?.plugin ?? null;
const isSales = primaryPlugin === 'sales';
const isOtherPlugin = primaryPlugin && primaryPlugin !== 'sales';
const isUnscoped = detectedPlugins.length === 0;

// ---------- Skill detection ----------

const SKILL_RULES = [
  {
    skill: 'add-deal-field',
    keywords: ['add field', 'add a field', 'new field', 'add property', 'add column on deal'],
    shapes: [/add\s+\w+\s+(to|on)\s+deal/i, /\bfield\b/i],
  },
  {
    skill: 'add-sales-graphql-query',
    keywords: ['add query', 'new query', 'query for', 'graphql query'],
    shapes: [/\bquery\b/i],
  },
  {
    skill: 'add-sales-mutation',
    keywords: ['add mutation', 'new mutation', 'bulk', 'archive', 'restore'],
    shapes: [/\bmutation\b/i],
  },
  {
    skill: 'add-sales-ui-page',
    keywords: ['add page', 'new page', 'dashboard', 'view', 'screen', 'route'],
    shapes: [/\bpage\b/i, /\bdashboard\b/i],
  },
  {
    skill: 'add-sales-automation',
    keywords: ['automation', 'when ', 'trigger', 'auto-create', 'auto create'],
    shapes: [/\bautomation\b/i, /\btrigger\b/i],
  },
  {
    skill: 'add-sales-segment-field',
    keywords: ['segment', 'filter dimension', 'segment builder'],
    shapes: [/\bsegment\b/i],
  },
  {
    skill: 'add-sales-trpc-procedure',
    keywords: ['trpc', 'rpc procedure', 'cross-plugin call'],
    shapes: [/\btrpc\b/i],
  },
];

function detectSkill(text) {
  if (opts.forcedSkill) return { skill: opts.forcedSkill, matchedKeyword: 'forced via --skill' };
  const lower = text.toLowerCase();
  for (const rule of SKILL_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) return { skill: rule.skill, matchedKeyword: kw };
    }
    for (const re of rule.shapes) {
      const m = text.match(re);
      if (m) return { skill: rule.skill, matchedKeyword: m[0] };
    }
  }
  return null;
}

const skillMatch = isSales ? detectSkill(wish) : null;
const detectedSkill = skillMatch?.skill ?? null;

// ---------- File reading (best-effort, never crash) ----------

function safeRead(absPath, fallback = '') {
  try {
    if (!existsSync(absPath)) return fallback;
    return readFileSync(absPath, 'utf8');
  } catch {
    return fallback;
  }
}

function inline(path, opts = {}) {
  const { maxLines } = opts;
  const content = safeRead(resolve(AGENTS, path));
  if (!content) return `(missing: .agents/${path})`;
  if (!maxLines) return content;
  const lines = content.split('\n');
  if (lines.length <= maxLines) return content;
  return lines.slice(0, maxLines).join('\n') + `\n\n… (truncated; full content in .agents/${path})`;
}

function lastNLessons(n) {
  const lessons = safeRead(resolve(AGENTS, 'memory/lessons.md'));
  if (!lessons) return '';
  const entriesIdx = lessons.indexOf('## Entries');
  const body = entriesIdx === -1 ? lessons : lessons.slice(entriesIdx);
  const blocks = body.split(/\n(?=## \d{4}-\d{2}-\d{2})/).slice(1);
  return blocks.slice(0, n).join('\n').trim();
}

// ---------- Prompt assembly ----------

const lines = [];

// Header
lines.push('# Sales Workflow — prompt assembled by erxes-wish');
lines.push('');
lines.push(`**Wish:** ${wish}`);
lines.push('');
lines.push(`**Working directory:** \`${REPO_ROOT}\``);
lines.push('');

// Plugin scope
lines.push('## Scope detected');
if (isSales) {
  lines.push('- Primary plugin: **sales**');
  if (detectedSkill) {
    lines.push(`- Likely skill: \`.agents/skills/sales/${detectedSkill}.md\``);
    lines.push('  → READ THIS SKILL IN FULL in Phase 1 ROUTE.');
  } else {
    lines.push('- No specific skill confidently detected. Phase 1 ROUTE: review all skills in `.agents/skills/sales/`.');
  }
} else if (isOtherPlugin) {
  lines.push(`- Detected plugin: **${primaryPlugin}**`);
  lines.push('- **STOP.** The `.agents/` system is sales-only today. Tell the developer this wish cannot follow the workflow yet. See `.agents/EXTENDING.md`.');
} else {
  lines.push('- No plugin scope detected from keywords. Ask the developer to clarify which plugin / surface this affects before proceeding.');
}
if (detectedPlugins.length > 1) {
  lines.push(`- Multiple plugin keywords matched: ${detectedPlugins.map(m => m.plugin).join(', ')}. Treat as cross-plugin; primary is **${primaryPlugin}**, others via federation/tRPC.`);
}
lines.push('');

// What to do
lines.push('## What you do now');
lines.push('');
if (isOtherPlugin) {
  lines.push(`STOP. Report to the developer: this wish targets the **${primaryPlugin}** plugin, but the workflow is currently sales-only. Two options to surface:`);
  lines.push('');
  lines.push('1. Apply the `.agents/EXTENDING.md` playbook to add the workflow for this plugin (one-time investment).');
  lines.push('2. Treat this wish as one-off without the workflow guards (no slop checklist, no fixture-seeded tests, no captured lessons).');
  lines.push('');
  lines.push('Do not silently proceed with option 2.');
  lines.push('');
} else if (isUnscoped) {
  lines.push('STOP. The wish text did not match any plugin keywords. Ask the developer:');
  lines.push('');
  lines.push('1. Which plugin/surface does this touch? (sales / operation / frontline / accounting / payment / content / insurance / loyalty / tourism / mongolian / cross-plugin)');
  lines.push('2. Is this a feature add, a bug fix, or a refactor?');
  lines.push('');
  lines.push('Re-run `erxes-wish` with the disambiguated wording after they answer.');
  lines.push('');
} else {
  lines.push('1. Confirm the wish with the developer if anything is ambiguous (Phase 0 WISH).');
  lines.push('2. Follow `.agents/WORKFLOW.md` end to end. 7 phases. Three human gates: WISH confirm, SPEC approval, PR review.');
  lines.push('3. Open a **DRAFT** PR at the end. Do not auto-merge. Do not push to `main`.');
  lines.push('4. After shipping, append a lesson to `.agents/memory/lessons.md` if you learned something non-obvious.');
  lines.push('5. NO Anthropic / Claude / AI branding in commits, PR title, PR body, or code comments. NO `Co-Authored-By` trailers.');
  lines.push('');
}

// System prompt
if (!opts.noSystemPrompt) {
  lines.push('---');
  lines.push('');
  lines.push('## `.agents/SYSTEM-PROMPT.md` (constitution — non-negotiable)');
  lines.push('');
  lines.push(inline('SYSTEM-PROMPT.md'));
  lines.push('');
}

// Workflow summary
lines.push('---');
lines.push('');
lines.push('## `.agents/WORKFLOW.md` (7 phases — see file for full text)');
lines.push('');
lines.push(inline('WORKFLOW.md', { maxLines: 80 }));
lines.push('');

// Lessons
if (!opts.noLessons) {
  lines.push('---');
  lines.push('');
  lines.push('## Recent `.agents/memory/lessons.md` entries (READ FIRST — past mistakes documented)');
  lines.push('');
  const recent = lastNLessons(8);
  lines.push(recent || '(no entries yet)');
  lines.push('');
}

// Slop checklist
lines.push('---');
lines.push('');
lines.push('## `.agents/SLOP-CHECKLIST.md` (forbidden patterns — re-read before declaring done)');
lines.push('');
lines.push(inline('SLOP-CHECKLIST.md', { maxLines: 200 }));
lines.push('');

// Skill body
if (isSales && detectedSkill) {
  const skillPath = `skills/sales/${detectedSkill}.md`;
  const skillBody = safeRead(resolve(AGENTS, skillPath));
  if (skillBody) {
    lines.push('---');
    lines.push('');
    lines.push(`## \`.agents/${skillPath}\` (the routed skill — follow Phase 3-5 exactly)`);
    lines.push('');
    lines.push(skillBody);
    lines.push('');
  }
}

// Closing
lines.push('---');
lines.push('');
lines.push('## Reminder');
lines.push('');
lines.push('- When unsure: STOP and ask the developer. Slop is worse than slow.');
lines.push('- `evals/run.sh sales` exit 0 is the "done" oracle. Compile is not done.');
lines.push('- Mirror precedent. Never generate a sister-feature-shape file from scratch.');
lines.push('- Atomic commits. ≤ ~50 LOC per commit.');
lines.push('- Read `.agents/memory/lessons.md` in full if it grew since this prompt was assembled.');

const output = lines.join('\n') + '\n';
process.stdout.write(output);

// ---------- Stderr status (always) ----------

const totalLines = output.split('\n').length;
const totalBytes = Buffer.byteLength(output, 'utf8');
const prettyBytes = totalBytes > 1024 ? `${(totalBytes / 1024).toFixed(1)} KB` : `${totalBytes} B`;
const pipedStdout = !process.stdout.isTTY;

log('');
log(rule('erxes-wish'));
if (isSales) {
  log(`  ✓ Briefing assembled for: "${wish}"`);
  log(`    Plugin:   sales            (matched on "${primaryMatch.matchedKeyword}")`);
  if (detectedSkill) {
    log(`    Skill:    ${detectedSkill.padEnd(17)}(matched on "${skillMatch.matchedKeyword}")`);
  } else {
    log(`    Skill:    none auto-detected — AI will pick in Phase 1 ROUTE`);
  }
  if (!opts.noLessons) {
    log(`    Lessons:  8 most recent embedded`);
  }
  log(`    Total:    ${totalLines} lines (~${prettyBytes})`);
  if (pipedStdout) {
    log(`  ✓ Output piped → paste into your AI tool to begin Phase 0`);
  } else {
    log(`  ✓ Output written to stdout — pipe to pbcopy or > file.md to use it`);
  }
  log(`  ℹ See active wishes: pnpm --silent erxes-wish --list`);
} else if (isOtherPlugin) {
  log(`  ⚠ Detected plugin: ${primaryPlugin}            (matched on "${primaryMatch.matchedKeyword}")`);
  log(`  ⚠ STOP block emitted — workflow is sales-only today`);
  log(`    Your AI will halt and tell you when it reads this prompt.`);
  log(`    Total: ${totalLines} lines (~${prettyBytes})`);
} else {
  log(`  ⚠ No plugin scope detected from keywords`);
  log(`    STOP block emitted — AI will ask you to clarify which plugin.`);
  log(`    Total: ${totalLines} lines (~${prettyBytes})`);
}
log(rule());

// ============================================================
// Subcommand implementations
// ============================================================

function inspectWish(wishDir) {
  const abs = resolve(WISHES, wishDir);
  let stage = null;
  let mostRecentMs = 0;
  let halted = false;
  for (const { artifact, phase, label } of PHASE_ARTIFACTS) {
    const p = resolve(abs, artifact);
    if (existsSync(p)) {
      stage = { phase, label };
      const m = statSync(p).mtimeMs;
      if (m > mostRecentMs) mostRecentMs = m;
    }
  }
  if (existsSync(resolve(abs, 'STATUS.md'))) {
    halted = true;
    const m = statSync(resolve(abs, 'STATUS.md')).mtimeMs;
    if (m > mostRecentMs) mostRecentMs = m;
  }
  return { id: wishDir, stage, halted, mostRecentMs };
}

function timeAgo(ms) {
  const diff = Date.now() - ms;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ms).toISOString().slice(0, 10);
}

function printWishList() {
  if (!existsSync(WISHES)) {
    log(rule('erxes-wish --list'));
    log(`  (no .agents/wishes/ directory yet)`);
    log(rule());
    return;
  }
  const entries = readdirSync(WISHES, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => inspectWish(e.name))
    .sort((a, b) => b.mostRecentMs - a.mostRecentMs);

  log(rule(`erxes-wish --list (${entries.length} wish dir${entries.length === 1 ? '' : 's'})`));
  if (entries.length === 0) {
    log(`  (no wishes captured yet — run pnpm --silent erxes-wish "<wish>" to begin)`);
    log(rule());
    return;
  }
  const idCol = Math.max(8, ...entries.map(e => e.id.length));
  const phaseCol = 14;
  log(`  ${'ID'.padEnd(idCol)}  ${'PHASE'.padEnd(phaseCol)}  UPDATED`);
  log(`  ${'─'.repeat(idCol)}  ${'─'.repeat(phaseCol)}  ${'─'.repeat(10)}`);
  for (const e of entries) {
    const phase = e.halted
      ? `${e.stage?.phase ?? '?'} HALTED`
      : (e.stage ? `${e.stage.phase}` : '0 (empty)');
    const updated = e.mostRecentMs ? timeAgo(e.mostRecentMs) : '—';
    const marker = e.halted ? '⚠' : (e.stage?.phase.startsWith('7') ? '✓' : '→');
    log(`  ${marker} ${e.id.padEnd(idCol - 2)}  ${phase.padEnd(phaseCol)}  ${updated}`);
  }
  log(rule());
  log(`  Detail: pnpm --silent erxes-wish --show <id>`);
}

function printWishDetail(id) {
  const abs = resolve(WISHES, id);
  if (!existsSync(abs)) {
    log(rule(`erxes-wish --show ${id}`));
    log(`  (not found: .agents/wishes/${id})`);
    log(`  Available wishes:`);
    if (existsSync(WISHES)) {
      for (const e of readdirSync(WISHES)) log(`    - ${e}`);
    }
    log(rule());
    process.exit(1);
  }
  const inspected = inspectWish(id);
  log(rule(`erxes-wish --show ${id}`));
  log(`  Path: .agents/wishes/${id}/`);
  log(`  Status: ${inspected.halted ? 'HALTED' : (inspected.stage ? `${inspected.stage.phase} (${inspected.stage.label})` : 'empty')}`);
  log(`  Last updated: ${inspected.mostRecentMs ? timeAgo(inspected.mostRecentMs) : '—'}`);
  log('');
  log(`  Artifacts:`);
  for (const { artifact, phase, label } of PHASE_ARTIFACTS) {
    const p = resolve(abs, artifact);
    const exists = existsSync(p);
    const marker = exists ? '✓' : '✗';
    const when = exists ? timeAgo(statSync(p).mtimeMs) : '';
    log(`    ${marker} ${artifact.padEnd(12)} ${phase.padEnd(12)} ${exists ? '(' + label + ', ' + when + ')' : ''}`);
  }
  if (existsSync(resolve(abs, 'STATUS.md'))) {
    log(`    ⚠ STATUS.md      halted        (${timeAgo(statSync(resolve(abs, 'STATUS.md')).mtimeMs)})`);
  }
  log(rule());
}
