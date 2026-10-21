/**
 * Minimal semver range matching for a plugin's `platform` range against the
 * running erxes version. Supports `||`, space-separated comparators
 * (`>=`, `>`, `<=`, `<`, `=`), `^`, `~`, partial versions (`3.2`) and
 * `x`/`*` wildcards — the forms plugin configs use.
 */

type TVersion = [number, number, number, string[]];

const parseVersion = (value: string): TVersion | null => {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(
    value.trim(),
  );

  if (!match) {
    return null;
  }

  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    match[4] ? match[4].split('.') : [],
  ];
};

const comparePrerelease = (left: string[], right: string[]) => {
  if (!left.length || !right.length) {
    // A release sorts above any prerelease of the same version.
    return Number(!left.length) - Number(!right.length);
  }

  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    if (left[i] === undefined) return -1;
    if (right[i] === undefined) return 1;

    const leftNumber = /^\d+$/.test(left[i]);
    const rightNumber = /^\d+$/.test(right[i]);

    if (leftNumber && rightNumber) {
      const diff = Number(left[i]) - Number(right[i]);
      if (diff) return Math.sign(diff);
    } else if (leftNumber !== rightNumber) {
      return leftNumber ? -1 : 1;
    } else if (left[i] !== right[i]) {
      return left[i] < right[i] ? -1 : 1;
    }
  }

  return 0;
};

const compare = (left: TVersion, right: TVersion) => {
  for (let i = 0; i < 3; i++) {
    const diff = (left[i] as number) - (right[i] as number);
    if (diff) return Math.sign(diff);
  }

  return comparePrerelease(left[3], right[3]);
};

/** `3`, `3.2`, `3.2.x` → known parts; missing or wildcard parts are null. */
const parsePartial = (value: string) => {
  const [core, prerelease] = value.split('-', 2);
  const parts = core
    .replace(/^v/, '')
    .split('.')
    .map((part) => (/^\d+$/.test(part) ? Number(part) : null));

  return {
    major: parts[0] ?? null,
    minor: parts[1] ?? null,
    patch: parts[2] ?? null,
    prerelease: prerelease ? prerelease.split('.') : [],
  };
};

type TComparator = { operator: string; version: TVersion };

const lowerBound = (partial: ReturnType<typeof parsePartial>): TVersion => [
  partial.major ?? 0,
  partial.minor ?? 0,
  partial.patch ?? 0,
  partial.prerelease,
];

const expandComparator = (token: string): TComparator[] | null => {
  const match = /^(\^|~|>=|<=|>|<|=)?\s*(.+)$/.exec(token);

  if (!match) {
    return null;
  }

  const operator = match[1] || '';
  const partial = parsePartial(match[2]);

  if (partial.major === null) {
    return operator ? null : [];
  }

  const { major, minor, patch } = partial;
  const low = lowerBound(partial);

  if (operator === '^') {
    let high: TVersion;
    if (major > 0 || minor === null) high = [major + 1, 0, 0, ['0']];
    else if (minor > 0 || patch === null) high = [0, minor + 1, 0, ['0']];
    else high = [0, 0, (patch ?? 0) + 1, ['0']];
    return [
      { operator: '>=', version: low },
      { operator: '<', version: high },
    ];
  }

  if (operator === '~' || (!operator && (minor === null || patch === null))) {
    const high: TVersion =
      minor === null ? [major + 1, 0, 0, ['0']] : [major, minor + 1, 0, ['0']];
    // A bare partial (`3.2`) means "any 3.2.x"; `~3.2.5` means >=3.2.5.
    const from: TVersion =
      operator === '~' ? low : [major, minor ?? 0, 0, partial.prerelease];
    return [
      { operator: '>=', version: from },
      { operator: '<', version: high },
    ];
  }

  return [{ operator: operator || '=', version: low }];
};

const test = ({ operator, version }: TComparator, target: TVersion) => {
  const order = compare(target, version);

  switch (operator) {
    case '>=':
      return order >= 0;
    case '>':
      return order > 0;
    case '<=':
      return order <= 0;
    case '<':
      return order < 0;
    default:
      return order === 0;
  }
};

/**
 * Whether `version` satisfies `range`. Prereleases of the running platform
 * (e.g. `3.2.25-next.4`) count as that release line, so `~3.2` accepts them.
 * Returns `null` when either side cannot be parsed.
 */
export const satisfiesPlatformRange = (
  version: string,
  range: string,
): boolean | null => {
  const target = parseVersion(version);

  if (!target) {
    return null;
  }

  const releaseLine: TVersion = [target[0], target[1], target[2], []];
  let valid = true;

  const matches = range.split('||').some((alternative) => {
    const tokens = alternative
      .trim()
      .replace(/(\^|~|>=|<=|>|<|=)\s+/g, '$1')
      .split(/\s+/)
      .filter(Boolean);
    const comparators = tokens.flatMap((token) => {
      const expanded = expandComparator(token);
      if (!expanded) valid = false;
      return expanded ?? [];
    });

    return comparators.every(
      (comparator) => test(comparator, target) || test(comparator, releaseLine),
    );
  });

  return valid ? matches : null;
};
