export type OrgPair = { source: string; target: string };

export const ORG_PAIRS: OrgPair[] = [
  // { source: 'belty', target: 'bbelty' }, done
  // { source: 'cmlbrotherss', target: 'cmlbrothers' }, done
  // { source: 'hipay', target: 'newhipay' }, done
  // { source: 'greatdate', target: 'newgreatdate' }, done
  // { source: 'tsembiibuteel', target: 'tsembiibuteelnew' }, done
  // { source: 'tsembiiauto', target: 'tsembiiautonew' }, done
  // { source: 'dboil', target: 'dboilnew' }, done

  // { source: 'newmilestone', target: 'nnewmilestone' },
  // { source: 'sukgarden', target: 'sukgardennew' },
  // { source: 'tansagamttan', target: 'tansagamttannew' },
  // { source: 'dermaestheticllc', target: 'dermaestheticnew' },
  // { source: 'burensukh', target: 'burensukhnew' },
  // { source: 'burensukhburen', target: 'bburensukhburen' },
  // { source: 'tsemtsgerkharsh', target: 'newtsemtsgerkharsh' },
  // { source: 'trillionlounge', target: 'trillionloungenew' },
  // { source: 'cargolink', target: 'cargolinknew' },
  { source: 'strawberry', target: 'newstrawberry' },
];

export function resolveOrgPairs(args: string[]): OrgPair[] {
  const { SOURCE_SUBDOMAIN, TARGET_SUBDOMAIN } = process.env;

  if (SOURCE_SUBDOMAIN && TARGET_SUBDOMAIN) {
    return [{ source: SOURCE_SUBDOMAIN, target: TARGET_SUBDOMAIN }];
  }

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
