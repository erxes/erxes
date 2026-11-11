export type OrgPair = { source: string; target: string };

export const ORG_PAIRS: OrgPair[] = [
  // { source: 'belty', target: 'bbelty' }, done
];

export function resolveOrgPairs(args: string[]): OrgPair[] {
  const { SOURCE_SUBDOMAIN, TARGET_SUBDOMAIN } = process.env;

  if (SOURCE_SUBDOMAIN && TARGET_SUBDOMAIN) {
    return [{ source: SOURCE_SUBDOMAIN, target: TARGET_SUBDOMAIN }];
  }

  return slicePairs(filterPairs(args), args);
}

function slicePairs(pairs: OrgPair[], args: string[]): OrgPair[] {
  const numberArg = (name: string): number | undefined => {
    const arg = args.find((a) => a.startsWith(`--${name}=`));

    if (!arg) {
      return undefined;
    }

    const value = Number(arg.slice(name.length + 3));

    if (!Number.isInteger(value) || value < 0) {
      console.error(`--${name} must be a non-negative integer`);
      process.exit(1);
    }

    return value;
  };

  const skip = numberArg('skip') ?? 0;
  const limit = numberArg('limit');

  return pairs.slice(skip, limit === undefined ? undefined : skip + limit);
}

function filterPairs(args: string[]): OrgPair[] {
  const orgArg = args.find((a) => a.startsWith('--org='));

  if (!orgArg) {
    return ORG_PAIRS;
  }

  const wanted = orgArg
    .slice('--org='.length)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const pairs = ORG_PAIRS.filter(
    (p) => wanted.includes(p.source) || wanted.includes(p.target),
  );

  const unknown = wanted.filter(
    (w) => !ORG_PAIRS.some((p) => p.source === w || p.target === w),
  );

  if (unknown.length) {
    console.error(`Unknown org(s) in --org: ${unknown.join(', ')}`);
    process.exit(1);
  }

  return pairs;
}
