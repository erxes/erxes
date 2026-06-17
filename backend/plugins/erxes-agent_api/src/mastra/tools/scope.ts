import { OperationMeta } from './operationRegistry';

// An agent's tool scope.
//   mode 'all'    → may search/execute every operation + every builtin.
//   mode 'custom' → restricted to `allowed`. Entries are one of:
//     - "<operationName>"  exact operation        (e.g. "dealsAdd")
//     - "plugin:<name>"    every op in a plugin    (e.g. "plugin:sales")
//     - "module:<name>"    every op in a module    (e.g. "module:customers")
//     - "builtin:<key>"    a builtin tool          (e.g. "builtin:calculator")
export interface ToolPolicy {
  mode: 'all' | 'custom';
  allowed: string[];
}

// Default is 'all' — an agent reaches every erxes operation unless explicitly
// restricted. Legacy agents (no toolPolicy persisted) therefore fall through to
// 'all' as well, matching the new product default.
export function resolveToolPolicy(agentConfig: unknown): ToolPolicy {
  const config = (agentConfig ?? {}) as {
    toolPolicy?: string;
    allowedTools?: unknown;
  };
  const mode = config.toolPolicy === 'custom' ? 'custom' : 'all';
  const allowed: string[] = Array.isArray(config.allowedTools)
    ? config.allowedTools
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];
  return { mode, allowed };
}

// True when `op` is within the policy. This is the programmatic boundary the
// search and execute meta-tools enforce: a restricted agent literally cannot run
// anything outside its allowlist, even if the model invents an operation name.
export function isOperationAllowed(
  op: OperationMeta,
  policy: ToolPolicy,
): boolean {
  if (policy.mode === 'all') return true;
  return (
    policy.allowed.includes(op.operation) ||
    policy.allowed.includes(`plugin:${op.plugin}`) ||
    policy.allowed.includes(`module:${op.module}`)
  );
}

/** True when the policy grants the given builtin tool key. */
export function isBuiltinAllowed(key: string, policy: ToolPolicy): boolean {
  if (policy.mode === 'all') return true;
  return policy.allowed.includes(`builtin:${key}`);
}

// True when the policy grants at least one erxes operation, so the runtime knows
// whether to bind the search/execute meta-tools at all.
export function hasAnyOperation(
  list: OperationMeta[],
  policy: ToolPolicy,
): boolean {
  if (policy.mode === 'all') return list.length > 0;
  return list.some((op) => isOperationAllowed(op, policy));
}

// A short human description of the allowed scope, injected into the system
// prompt so the model accurately understands its own reach.
export function scopeSummary(policy: ToolPolicy): string {
  if (policy.mode === 'all') {
    return 'You may use any operation listed in the installed-services inventory below — and ONLY those.';
  }

  const ops: string[] = [];
  const groups: string[] = [];
  for (const entry of policy.allowed) {
    if (entry.startsWith('plugin:'))
      groups.push(`all ${entry.slice(7)} operations`);
    else if (entry.startsWith('module:'))
      groups.push(`all ${entry.slice(7)} operations`);
    else if (entry.startsWith('builtin:')) continue;
    else ops.push(entry);
  }

  const parts = [...groups, ...ops];
  if (!parts.length) {
    return 'You have no erxes operations available.';
  }
  return `You are restricted to ONLY these operations — never attempt anything else: ${parts.join(
    ', ',
  )}.`;
}

// The agent's ground truth about what is actually installed, derived from the
// live registry (after policy filtering). Injected into the system prompt so
// the model answers "what can you do?" from reality instead of LLM priors
// about what a CRM usually has (it used to advertise deals/sales/automations
// on instances where those plugins aren't even running).
export function capabilityInventory(
  list: OperationMeta[],
  policy: ToolPolicy,
): { lines: string[]; fingerprint: string } {
  const allowed =
    policy.mode === 'all'
      ? list
      : list.filter((op) => isOperationAllowed(op, policy));

  // plugin → module → {reads, writes}
  const plugins = new Map<
    string,
    Map<string, { reads: number; writes: number }>
  >();
  for (const op of allowed) {
    const pluginName = op.plugin || 'other';
    const moduleName = op.module || 'other';
    let mods = plugins.get(pluginName);
    if (!mods) {
      mods = new Map();
      plugins.set(pluginName, mods);
    }
    let counts = mods.get(moduleName);
    if (!counts) {
      counts = { reads: 0, writes: 0 };
      mods.set(moduleName, counts);
    }
    if (op.operationType === 'mutation') counts.writes++;
    else counts.reads++;
  }

  const MAX_MODULES_SHOWN = 30;
  const lines: string[] = [];
  for (const [plugin, mods] of [...plugins.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const names = [...mods.keys()].sort((a, b) => a.localeCompare(b));
    const shown = names.slice(0, MAX_MODULES_SHOWN).join(', ');
    const more =
      names.length > MAX_MODULES_SHOWN
        ? `, +${names.length - MAX_MODULES_SHOWN} more`
        : '';
    const total = [...mods.values()].reduce(
      (sum, counts) => sum + counts.reads + counts.writes,
      0,
    );
    lines.push(`- ${plugin} (${total} operations): ${shown}${more}`);
  }

  // Stable identity of the installed/allowed surface — used to bust the agent
  // cache when plugins are enabled/disabled, so the prompt never goes stale.
  const fingerprint = `${[...plugins.keys()]
    .sort((a, b) => a.localeCompare(b))
    .join(',')}#${allowed.length}`;

  return { lines, fingerprint };
}
