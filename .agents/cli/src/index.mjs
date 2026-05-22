#!/usr/bin/env node
// .agents/cli/src/index.mjs
// Interactive TUI for the erxes .agents/ AI shipping system.
//
// Usage:
//   pnpm wish                      → launches interactive TUI (this file)
//   pnpm wish "<wish text>"        → non-interactive (delegates to .agents/bin/erxes-wish.mjs)

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp, useStdin } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';

import {
  assembleBriefing,
  listWishes,
  wishArtifactStatus,
  copyToClipboard,
  writeBriefingToFile,
  timeAgo,
  generateWishId,
  ALL_SKILLS,
  WISHES,
} from './lib.mjs';

const h = React.createElement;

// ─── Tiny helpers ────────────────────────────────────────────────────────

const T = (props, ...kids) => {
  if (typeof props === 'string') return h(Text, null, props);
  return h(Text, props, ...kids);
};
const B = (props, ...kids) => h(Box, props, ...kids);

// Shared SelectInput indicator/item — fixed-width so columns don't shift
const selectStyle = {
  indicatorComponent: ({ isSelected }) =>
    T({ color: 'cyan' }, isSelected ? '▸ ' : '  '),
  itemComponent: ({ label, isSelected }) =>
    T({ color: isSelected ? 'cyan' : undefined, bold: isSelected }, label),
};

// ─── Header ──────────────────────────────────────────────────────────────

const Header = ({ subtitle }) =>
  B({ flexDirection: 'column', paddingX: 1, paddingY: 0, borderStyle: 'round', borderColor: 'cyan' },
    T({ bold: true, color: 'cyan' }, '⚡ erxes-wish — interactive AI shipping CLI'),
    subtitle ? T({ dimColor: true }, subtitle) : null,
  );

// ─── Dashboard ───────────────────────────────────────────────────────────

// One-character status icon — colored separately so the icon always pops
const phaseIcon = (w) => {
  if (w.halted) return { icon: '⚠', color: 'yellow' };
  if (w.stage?.phase.startsWith('7')) return { icon: '✓', color: 'green' };
  if (w.stage?.phase.startsWith('0')) return { icon: '◦', color: 'gray' };
  if (w.stage?.phase) return { icon: '→', color: 'cyan' };
  return { icon: '◦', color: 'gray' };
};

// Plain-text item label — short, self-descriptive, no padding artefacts.
// Format: "<id> · <phase> · <when>"
const wishItemLabel = (w) => {
  const phase = w.halted ? 'HALTED' : (w.stage?.phase ?? '0 empty');
  return `${w.id}  ·  ${phase}  ·  ${timeAgo(w.mostRecentMs)}`;
};

const Dashboard = ({ wishes, onSelect }) => {
  const wishItems = wishes.map(w => {
    const { icon } = phaseIcon(w);
    return {
      label: `${icon}  ${wishItemLabel(w)}`,
      value: w.id,
      key: w.id,
    };
  });

  const menu = [
    { label: '+  New wish', value: '__new__', key: '__new__' },
    ...wishItems,
    { label: '↺  Refresh', value: '__refresh__', key: '__refresh__' },
    { label: '✕  Quit', value: '__quit__', key: '__quit__' },
  ];

  return B({ flexDirection: 'column' },
    h(Header, { subtitle: 'Dashboard — start a new wish or open an existing one' }),
    wishes.length === 0
      ? B({ paddingX: 2, paddingY: 1 }, T({ dimColor: true }, '(no wishes yet — pick "+ New wish" below)'))
      : B({ paddingX: 2, paddingTop: 1, flexDirection: 'column' },
          T({ dimColor: true }, `${wishes.length} wish${wishes.length === 1 ? '' : 'es'}   ·   ◦ empty   →  in progress   ✓ shipped   ⚠ halted`),
        ),
    B({ paddingX: 1, marginTop: 1 },
      h(SelectInput, { items: menu, onSelect: item => onSelect(item.value), ...selectStyle }),
    ),
    B({ paddingX: 2, paddingY: 1 },
      T({ dimColor: true }, '↑/↓ navigate  ·  Enter select  ·  q quit  ·  r refresh  ·  n new'),
    ),
  );
};

// ─── New Wish wizard ─────────────────────────────────────────────────────

const NewWishInput = ({ initial = '', onSubmit, onCancel }) => {
  const [value, setValue] = useState(initial);
  useInput((input, key) => { if (key.escape) onCancel(); });
  return B({ flexDirection: 'column' },
    h(Header, { subtitle: 'New wish — describe what you want' }),
    B({ flexDirection: 'column', paddingX: 2, paddingY: 1 },
      T({ bold: true }, 'What is the wish?'),
      T({ dimColor: true }, 'e.g. "add a riskLevel field to deals (low/medium/high, default low)"'),
      B({ marginY: 1, paddingX: 1, borderStyle: 'single', borderColor: 'cyan' },
        h(TextInput, { value, onChange: setValue, onSubmit, placeholder: 'Type your wish here…' }),
      ),
      T({ dimColor: true }, 'Enter submit · Esc cancel'),
    ),
  );
};

const NewWishConfirm = ({ wish, meta, onAccept, onSkillOverride, onBack }) => {
  useInput((input, key) => { if (key.escape) onBack(); });
  const skillItems = [
    { label: meta.detectedSkill ? `Keep detected: ${meta.detectedSkill}` : 'No skill — AI picks in Phase 1', value: '__keep__' },
    ...ALL_SKILLS.map(s => ({ label: `Override → ${s}`, value: s })),
    { label: '← Back to edit wish (Esc)', value: '__back__' },
  ];
  return B({ flexDirection: 'column' },
    h(Header, { subtitle: 'Confirm scope & skill' }),
    B({ flexDirection: 'column', paddingX: 2, paddingY: 1 },
      T(null, 'Wish: ', T({ color: 'cyan' }, wish)),
      T({}),
      meta.isSales
        ? B({ flexDirection: 'column' },
            T({ color: 'green' }, '✓ Plugin: sales  ', T({ dimColor: true }, '(matched on "' + meta.primaryMatch.matchedKeyword + '")')),
            meta.detectedSkill
              ? T({ color: 'green' }, '✓ Skill:  ' + meta.detectedSkill + '  ', T({ dimColor: true }, '(matched on "' + meta.skillMatch.matchedKeyword + '")'))
              : T({ color: 'yellow' }, '⚠ Skill:  none auto-detected — AI will pick in Phase 1 ROUTE'),
          )
        : meta.isOtherPlugin
        ? B({ flexDirection: 'column' },
            T({ color: 'yellow', bold: true }, '⚠ Detected plugin: ' + meta.primaryPlugin),
            T({ dimColor: true }, 'STOP block will be in the briefing — AI will halt because workflow is sales-only.'),
          )
        : B({ flexDirection: 'column' },
            T({ color: 'yellow', bold: true }, '⚠ No plugin scope detected'),
            T({ dimColor: true }, 'STOP block will be in the briefing — AI will ask for clarification.'),
          ),
      T({}),
      T({ dimColor: true }, 'Briefing size: ' + meta.lineCount + ' lines (~' + (meta.byteCount / 1024).toFixed(1) + ' KB)'),
    ),
    B({ paddingX: 1, marginTop: 1 },
      h(SelectInput, {
        ...selectStyle,
        items: [
          { label: 'Continue with current routing →', value: '__accept__' },
          ...(meta.isSales ? skillItems : [{ label: '← Back to edit wish (Esc)', value: '__back__' }]),
        ],
        onSelect: (item) => {
          if (item.value === '__accept__') onAccept();
          else if (item.value === '__back__') onBack();
          else if (item.value === '__keep__') onAccept();
          else onSkillOverride(item.value);
        },
      }),
    ),
  );
};

const NewWishOutput = ({ briefing, meta, wishId, onDone }) => {
  const [status, setStatus] = useState(null);
  useInput((input, key) => { if (key.escape) onDone(); });
  const items = [
    { label: '📋 Copy to clipboard (paste into Cursor / ChatGPT / Claude / etc.)', value: 'clipboard' },
    { label: '📁 Save to file at .agents/wishes/' + wishId + '/briefing.md', value: 'file' },
    { label: '📋 + 📁 Both: copy to clipboard AND save to file', value: 'both' },
    { label: '🖨  Print to stdout (then exit)', value: 'stdout' },
    { label: '← Back to confirm (Esc)', value: '__back__' },
  ];
  const handle = (value) => {
    if (value === '__back__') { onDone({ back: true }); return; }
    if (value === 'clipboard' || value === 'both') {
      const ok = copyToClipboard(briefing);
      setStatus(prev => ({ ...prev, clipboard: ok ? '✓ copied to clipboard' : '✗ clipboard failed (no pbcopy/xclip?)' }));
    }
    if (value === 'file' || value === 'both') {
      const path = writeBriefingToFile(briefing, wishId);
      setStatus(prev => ({ ...prev, file: '✓ saved to ' + path.replace(/^.*\.agents/, '.agents') }));
    }
    if (value === 'stdout') { onDone({ stdout: true }); return; }
    setTimeout(() => onDone({ done: true }), 1500);
  };
  return B({ flexDirection: 'column' },
    h(Header, { subtitle: 'Where to send the briefing' }),
    B({ flexDirection: 'column', paddingX: 2, paddingY: 1 },
      T({ color: 'green' }, '✓ Briefing assembled (' + meta.lineCount + ' lines, ~' + (meta.byteCount / 1024).toFixed(1) + ' KB)'),
      T({ dimColor: true }, 'Wish ID: ' + wishId),
      T({}),
      status?.clipboard ? T({ color: status.clipboard.startsWith('✓') ? 'green' : 'red' }, status.clipboard) : null,
      status?.file ? T({ color: 'green' }, status.file) : null,
    ),
    B({ paddingX: 1, marginTop: 1 },
      h(SelectInput, { items, onSelect: item => handle(item.value), ...selectStyle }),
    ),
  );
};

const NewWishFlow = ({ initial = '', onExit }) => {
  const [step, setStep] = useState('input');
  const [wish, setWish] = useState(initial);
  const [forcedSkill, setForcedSkill] = useState(null);
  const [briefing, setBriefing] = useState(null);
  const [meta, setMeta] = useState(null);
  const [wishId, setWishId] = useState(null);

  const assemble = () => {
    const result = assembleBriefing(wish, { forcedSkill });
    setBriefing(result.output);
    setMeta(result.meta);
    setWishId(generateWishId(wish));
    setStep('confirm');
  };

  if (step === 'input') return h(NewWishInput, {
    initial: wish,
    onCancel: onExit,
    onSubmit: (val) => { setWish(val); setForcedSkill(null); setTimeout(assemble, 0); },
  });
  if (step === 'confirm' && meta) return h(NewWishConfirm, {
    wish, meta,
    onBack: () => setStep('input'),
    onAccept: () => setStep('output'),
    onSkillOverride: (skill) => { setForcedSkill(skill); const r = assembleBriefing(wish, { forcedSkill: skill }); setBriefing(r.output); setMeta(r.meta); },
  });
  if (step === 'output' && briefing) return h(NewWishOutput, {
    briefing, meta, wishId,
    onDone: (action) => {
      if (action?.back) { setStep('confirm'); return; }
      if (action?.stdout) { process.stdout.write(briefing); onExit(); return; }
      onExit({ created: wishId });
    },
  });
  return B({ paddingX: 2 }, h(Spinner, { type: 'dots' }), T(null, ' Working…'));
};

// ─── Wish Detail ─────────────────────────────────────────────────────────

const WishDetail = ({ wishId, onBack }) => {
  const status = wishArtifactStatus(wishId);
  useInput((input, key) => { if (key.escape || input === 'b') onBack(); });
  if (!status) {
    return B({ flexDirection: 'column' },
      h(Header, { subtitle: 'Wish not found' }),
      B({ paddingX: 2, paddingY: 1 },
        T({ color: 'red' }, '✗ .agents/wishes/' + wishId + ' does not exist'),
        T({ dimColor: true }, 'Esc / b to go back'),
      ),
    );
  }
  return B({ flexDirection: 'column' },
    h(Header, { subtitle: 'Wish: ' + wishId }),
    B({ flexDirection: 'column', paddingX: 2, paddingY: 1 },
      T(null, 'Path: ', T({ color: 'cyan' }, '.agents/wishes/' + wishId + '/')),
      T({}),
      T({ bold: true }, 'Artifacts:'),
      ...status.map(s =>
        T({ color: s.exists ? (s.artifact === 'STATUS.md' ? 'yellow' : 'green') : 'gray' },
          `  ${s.exists ? '✓' : '✗'} ${s.artifact.padEnd(14)} ${s.phase.padEnd(13)} ${s.exists ? '(' + s.label + ', ' + timeAgo(s.updatedMs) + ')' : ''}`,
        ),
      ),
      T({}),
      T({ dimColor: true }, 'To open in editor:'),
      T({ color: 'cyan' }, `  $EDITOR .agents/wishes/${wishId}/`),
      T({ dimColor: true }, 'To view an artifact:'),
      T({ color: 'cyan' }, `  cat .agents/wishes/${wishId}/<artifact>`),
      T({}),
      T({ dimColor: true }, 'Esc or b → back to dashboard'),
    ),
  );
};

// ─── App ─────────────────────────────────────────────────────────────────

const App = ({ initialView, initialWish }) => {
  const [view, setView] = useState(initialView ?? 'dashboard');
  const [selectedWishId, setSelectedWishId] = useState(null);
  const [wishes, setWishes] = useState(listWishes());
  const [refreshKey, setRefreshKey] = useState(0);
  const { exit } = useApp();
  const { isRawModeSupported } = useStdin();

  useEffect(() => { setWishes(listWishes()); }, [refreshKey, view]);
  useInput((input, key) => {
    if (view === 'dashboard') {
      if (input === 'q' || (key.ctrl && input === 'c')) exit();
      if (input === 'n') setView('new');
      if (input === 'r') setRefreshKey(k => k + 1);
    }
  });

  if (!isRawModeSupported) {
    return B({ paddingX: 2 },
      T({ color: 'red' }, 'Interactive TUI requires a TTY. Use direct mode:'),
      T({ color: 'cyan' }, '  pnpm --silent erxes-wish "<wish text>"'),
    );
  }

  if (view === 'new') {
    return h(NewWishFlow, {
      initial: initialWish ?? '',
      onExit: () => { setRefreshKey(k => k + 1); setView('dashboard'); },
    });
  }
  if (view === 'detail' && selectedWishId) {
    return h(WishDetail, { wishId: selectedWishId, onBack: () => setView('dashboard') });
  }
  return h(Dashboard, {
    wishes,
    onSelect: (val) => {
      if (val === '__quit__') exit();
      else if (val === '__new__') setView('new');
      else if (val === '__refresh__') setRefreshKey(k => k + 1);
      else { setSelectedWishId(val); setView('detail'); }
    },
  });
};

// ─── Entry ───────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const wishArg = argv.filter(a => !a.startsWith('--')).join(' ').trim();

if (wishArg && !argv.includes('--ui')) {
  // Direct (non-interactive) mode: same behavior as the bin script.
  // The script in package.json can route here for `pnpm wish "<text>"`.
  const result = assembleBriefing(wishArg);
  process.stdout.write(result.output);
  // Brief stderr summary matching the existing CLI's UX:
  process.stderr.write(`\n✓ Briefing assembled — ${result.meta.lineCount} lines, plugin=${result.meta.primaryPlugin ?? 'none'}, skill=${result.meta.detectedSkill ?? 'none'}\n`);
  process.exit(0);
}

render(h(App, { initialView: wishArg ? 'new' : 'dashboard', initialWish: wishArg }));
