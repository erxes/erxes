// .agents/cli/src/lib.mjs
// Shared logic for the interactive TUI: detection, prompt assembly, wish inspection.
// Same primitives as .agents/bin/erxes-wish.mjs but exported as ES modules.

import { readFileSync, existsSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// ─── Paths ────────────────────────────────────────────────────────────────

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(SCRIPT_DIR, '..', '..', '..');
export const AGENTS = resolve(REPO_ROOT, '.agents');
export const WISHES = resolve(AGENTS, 'wishes');

export const PHASE_ARTIFACTS = [
  { artifact: 'WISH.md',   phase: '0 WISH',    label: 'captured' },
  { artifact: 'SPEC.md',   phase: '2 SPEC',    label: 'drafted' },
  { artifact: 'GROUND.md', phase: '3 GROUND',  label: 'mapped' },
  { artifact: 'PLAN.md',   phase: '4 PLAN',    label: 'planned' },
  { artifact: 'REVIEW.md', phase: '7 REVIEW',  label: 'shipped' },
];

// ─── Plugin / Skill Detection ────────────────────────────────────────────

export const PLUGIN_KEYWORDS = {
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

const SKILL_RULES = [
  { skill: 'add-deal-field',           keywords: ['add field', 'add a field', 'new field', 'add property'], shapes: [/add\s+\w+\s+(to|on)\s+deal/i, /\bfield\b/i] },
  { skill: 'add-sales-graphql-query',  keywords: ['add query', 'new query', 'query for', 'graphql query'], shapes: [/\bquery\b/i] },
  { skill: 'add-sales-mutation',       keywords: ['add mutation', 'new mutation', 'bulk', 'archive', 'restore'], shapes: [/\bmutation\b/i] },
  { skill: 'add-sales-ui-page',        keywords: ['add page', 'new page', 'dashboard', 'view', 'screen', 'route'], shapes: [/\bpage\b/i, /\bdashboard\b/i] },
  { skill: 'add-sales-automation',     keywords: ['automation', 'when ', 'trigger', 'auto-create', 'auto create'], shapes: [/\bautomation\b/i, /\btrigger\b/i] },
  { skill: 'add-sales-segment-field',  keywords: ['segment', 'filter dimension', 'segment builder'], shapes: [/\bsegment\b/i] },
  { skill: 'add-sales-trpc-procedure', keywords: ['trpc', 'rpc procedure', 'cross-plugin call'], shapes: [/\btrpc\b/i] },
];

export const ALL_SKILLS = SKILL_RULES.map(r => r.skill);

export function detectPlugin(text) {
  const lower = text.toLowerCase();
  const matches = [];
  for (const [plugin, keywords] of Object.entries(PLUGIN_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) { matches.push({ plugin, matchedKeyword: kw }); break; }
    }
  }
  return matches;
}

export function detectSkill(text, forced = null) {
  if (forced) return { skill: forced, matchedKeyword: 'forced' };
  const lower = text.toLowerCase();
  for (const rule of SKILL_RULES) {
    for (const kw of rule.keywords) if (lower.includes(kw)) return { skill: rule.skill, matchedKeyword: kw };
    for (const re of rule.shapes) { const m = text.match(re); if (m) return { skill: rule.skill, matchedKeyword: m[0] }; }
  }
  return null;
}

// ─── File helpers ────────────────────────────────────────────────────────

function safeRead(absPath, fallback = '') {
  try { return existsSync(absPath) ? readFileSync(absPath, 'utf8') : fallback; }
  catch { return fallback; }
}

function inline(path, { maxLines } = {}) {
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

// ─── Prompt Assembly ─────────────────────────────────────────────────────

export function assembleBriefing(wish, opts = {}) {
  const { noLessons = false, noSystemPrompt = false, forcedSkill = null } = opts;
  const detectedPlugins = detectPlugin(wish);
  const primaryMatch = detectedPlugins[0] ?? null;
  const primaryPlugin = primaryMatch?.plugin ?? null;
  const isSales = primaryPlugin === 'sales';
  const isOtherPlugin = primaryPlugin && primaryPlugin !== 'sales';
  const isUnscoped = detectedPlugins.length === 0;
  const skillMatch = isSales ? detectSkill(wish, forcedSkill) : null;
  const detectedSkill = skillMatch?.skill ?? null;

  const lines = [];
  lines.push('# Sales Workflow — prompt assembled by erxes-wish');
  lines.push('');
  lines.push(`**Wish:** ${wish}`);
  lines.push('');
  lines.push(`**Working directory:** \`${REPO_ROOT}\``);
  lines.push('');
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
    lines.push(`- Multiple plugin keywords matched: ${detectedPlugins.map(m => m.plugin).join(', ')}. Treat as cross-plugin; primary is **${primaryPlugin}**.`);
  }
  lines.push('');
  lines.push('## What you do now');
  lines.push('');
  if (isOtherPlugin) {
    lines.push(`STOP. Report to the developer: this wish targets the **${primaryPlugin}** plugin, but the workflow is currently sales-only.`);
    lines.push('See `.agents/EXTENDING.md` for how to extend the system to other plugins.');
  } else if (isUnscoped) {
    lines.push('STOP. The wish text did not match any plugin keywords. Ask the developer to clarify which plugin / surface this affects, then re-run `erxes-wish` with disambiguated wording.');
  } else {
    lines.push('1. Confirm the wish with the developer if anything is ambiguous (Phase 0 WISH).');
    lines.push('2. Follow `.agents/WORKFLOW.md` end to end. 7 phases. Three human gates: WISH confirm, SPEC approval, PR review.');
    lines.push('3. Open a **DRAFT** PR at the end. Do not auto-merge. Do not push to `main`.');
    lines.push('4. After shipping, append a lesson to `.agents/memory/lessons.md` if you learned something non-obvious.');
    lines.push('5. NO Anthropic / Claude / AI branding in commits, PR title, PR body, or code comments. NO `Co-Authored-By` trailers.');
  }
  lines.push('');
  if (!noSystemPrompt) {
    lines.push('---');
    lines.push('');
    lines.push('## `.agents/SYSTEM-PROMPT.md` (constitution — non-negotiable)');
    lines.push('');
    lines.push(inline('SYSTEM-PROMPT.md'));
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  lines.push('## `.agents/WORKFLOW.md` (7 phases — see file for full text)');
  lines.push('');
  lines.push(inline('WORKFLOW.md', { maxLines: 80 }));
  lines.push('');
  if (!noLessons) {
    lines.push('---');
    lines.push('');
    lines.push('## Recent `.agents/memory/lessons.md` entries (READ FIRST — past mistakes documented)');
    lines.push('');
    lines.push(lastNLessons(8) || '(no entries yet)');
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  lines.push('## `.agents/SLOP-CHECKLIST.md` (forbidden patterns — re-read before declaring done)');
  lines.push('');
  lines.push(inline('SLOP-CHECKLIST.md', { maxLines: 200 }));
  lines.push('');
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
  return {
    output,
    meta: {
      wish,
      detectedPlugins,
      primaryPlugin,
      primaryMatch,
      isSales,
      isOtherPlugin,
      isUnscoped,
      detectedSkill,
      skillMatch,
      lineCount: output.split('\n').length,
      byteCount: Buffer.byteLength(output, 'utf8'),
    },
  };
}

// ─── Wish inspection ─────────────────────────────────────────────────────

export function inspectWish(wishDir) {
  const abs = resolve(WISHES, wishDir);
  let stage = null;
  let mostRecentMs = 0;
  let halted = false;
  for (const { artifact, phase, label } of PHASE_ARTIFACTS) {
    const p = resolve(abs, artifact);
    if (existsSync(p)) {
      stage = { artifact, phase, label };
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

export function listWishes() {
  if (!existsSync(WISHES)) return [];
  return readdirSync(WISHES, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => inspectWish(e.name))
    .sort((a, b) => b.mostRecentMs - a.mostRecentMs);
}

export function wishArtifactStatus(wishDir) {
  const abs = resolve(WISHES, wishDir);
  if (!existsSync(abs)) return null;
  const result = PHASE_ARTIFACTS.map(({ artifact, phase, label }) => {
    const p = resolve(abs, artifact);
    const exists = existsSync(p);
    return {
      artifact,
      phase,
      label,
      exists,
      updatedMs: exists ? statSync(p).mtimeMs : null,
      path: p,
    };
  });
  const statusPath = resolve(abs, 'STATUS.md');
  if (existsSync(statusPath)) {
    result.push({
      artifact: 'STATUS.md',
      phase: '— HALTED',
      label: 'halted',
      exists: true,
      updatedMs: statSync(statusPath).mtimeMs,
      path: statusPath,
    });
  }
  return result;
}

// ─── Output targets ──────────────────────────────────────────────────────

export function writeBriefingToFile(briefing, wishId) {
  const dir = resolve(WISHES, wishId);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const path = resolve(dir, 'briefing.md');
  writeFileSync(path, briefing, 'utf8');
  return path;
}

export function copyToClipboard(text) {
  // macOS: pbcopy. Linux: xclip / wl-copy. Windows: clip.
  const platform = process.platform;
  let cmd, args;
  if (platform === 'darwin') { cmd = 'pbcopy'; args = []; }
  else if (platform === 'win32') { cmd = 'clip'; args = []; }
  else { cmd = 'xclip'; args = ['-selection', 'clipboard']; }
  const result = spawnSync(cmd, args, { input: text });
  return result.status === 0;
}

export function timeAgo(ms) {
  if (!ms) return '—';
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

export function generateWishId(wish) {
  const date = new Date().toISOString().slice(0, 10);
  const slug = wish
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `${date}-${slug || 'wish'}`;
}
