#!/usr/bin/env node
// erxes-wish — tool-agnostic prompt enhancer for .agents/-driven feature wishes.
//
// Usage:
//   .agents/bin/erxes-wish "add confidenceScore to deals"
//   .agents/bin/erxes-wish "add confidenceScore to deals" | pbcopy
//   .agents/bin/erxes-wish "add confidenceScore to deals" --no-lessons   # smaller prompt
//   .agents/bin/erxes-wish --help
//
// Output: a complete, tool-agnostic prompt to stdout. Paste it into any AI tool
// (Claude Code, Cursor, ChatGPT, Codex CLI, Copilot Chat, Cline, Aider, …).
// The wrapped AI will arrive already knowing the workflow, the rules, recent
// lessons, and the routed skill — without the developer having to remember any
// of it.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..', '..');
const AGENTS = resolve(REPO_ROOT, '.agents');

// ---------- CLI parsing ----------

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  process.stderr.write(`erxes-wish — tool-agnostic prompt enhancer for .agents/

Usage:
  erxes-wish "<wish>"                          full prompt to stdout
  erxes-wish "<wish>" | pbcopy                 copy to macOS clipboard
  erxes-wish "<wish>" --no-lessons             skip lessons.md inline
  erxes-wish "<wish>" --no-system-prompt       skip SYSTEM-PROMPT.md inline
  erxes-wish "<wish>" --skill <skill-name>     force a specific skill
  erxes-wish --help

Examples:
  erxes-wish "add confidenceScore to deals"
  erxes-wish "show win-rate dashboard" --skill add-sales-ui-page
`);
  process.exit(args.length === 0 ? 2 : 0);
}

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

function detectPlugin(text) {
  const lower = text.toLowerCase();
  const matches = [];
  for (const [plugin, keywords] of Object.entries(PLUGIN_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        matches.push(plugin);
        break;
      }
    }
  }
  return matches;
}

const detectedPlugins = detectPlugin(wish);
const primaryPlugin = detectedPlugins[0] ?? null;
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
  if (opts.forcedSkill) return opts.forcedSkill;
  const lower = text.toLowerCase();
  for (const rule of SKILL_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) return rule.skill;
    if (rule.shapes.some(re => re.test(text))) return rule.skill;
  }
  return null;
}

const detectedSkill = isSales ? detectSkill(wish) : null;

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
  // Lessons are separated by `## YYYY-MM-DD` headings under `## Entries`.
  const entriesIdx = lessons.indexOf('## Entries');
  const body = entriesIdx === -1 ? lessons : lessons.slice(entriesIdx);
  const blocks = body.split(/\n(?=## \d{4}-\d{2}-\d{2})/).slice(1); // drop the "## Entries" header
  // Most recently added entries are at the top (we prepend on capture).
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
  lines.push(`- Multiple plugin keywords matched: ${detectedPlugins.join(', ')}. Treat as cross-plugin; primary is **${primaryPlugin}**, others via federation/tRPC.`);
}
lines.push('');

// What to do (the workflow handle)
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

// System prompt (constitution)
if (!opts.noSystemPrompt) {
  lines.push('---');
  lines.push('');
  lines.push('## `.agents/SYSTEM-PROMPT.md` (constitution — non-negotiable)');
  lines.push('');
  lines.push(inline('SYSTEM-PROMPT.md'));
  lines.push('');
}

// Workflow summary (always include headers; full file is at the path)
lines.push('---');
lines.push('');
lines.push('## `.agents/WORKFLOW.md` (7 phases — see file for full text)');
lines.push('');
lines.push(inline('WORKFLOW.md', { maxLines: 80 }));
lines.push('');

// Lessons (most recent N)
if (!opts.noLessons) {
  lines.push('---');
  lines.push('');
  lines.push('## Recent `.agents/memory/lessons.md` entries (READ FIRST — past mistakes documented)');
  lines.push('');
  const recent = lastNLessons(8);
  if (recent) {
    lines.push(recent);
  } else {
    lines.push('(no entries yet)');
  }
  lines.push('');
}

// Slop checklist (always include — short enough to embed)
lines.push('---');
lines.push('');
lines.push('## `.agents/SLOP-CHECKLIST.md` (forbidden patterns — re-read before declaring done)');
lines.push('');
lines.push(inline('SLOP-CHECKLIST.md', { maxLines: 200 }));
lines.push('');

// Skill body if detected
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

// Closing reminder
lines.push('---');
lines.push('');
lines.push('## Reminder');
lines.push('');
lines.push('- When unsure: STOP and ask the developer. Slop is worse than slow.');
lines.push('- `evals/run.sh sales` exit 0 is the "done" oracle. Compile is not done.');
lines.push('- Mirror precedent. Never generate a sister-feature-shape file from scratch.');
lines.push('- Atomic commits. ≤ ~50 LOC per commit.');
lines.push('- Read `.agents/memory/lessons.md` in full if it grew since this prompt was assembled.');

process.stdout.write(lines.join('\n') + '\n');
