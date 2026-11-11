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
  // { source: '5f8bcfc86c2488e0e6687c1d', target: '6aed7cdd5b095e5cf076d654' }, done
  // { source: '5f8bcfc86c2488e0e6687c1d', target: '026000' },
  // { source: '5f04fb971c25ab3f726f55ed', target: '11amps' },
  // { source: '5f37141f7ada549d08dea1cf', target: '123ictsolutions' },
  // { source: '5f0576032327c85486c5cda6', target: '241digital' },
  { source: '5f3b0cd77843521a0a1f1af2', target: '271brands' },
  { source: '5f63f7821d63f935c97f6ac8', target: '4678574266784659' },
  { source: '5f3452e1b9554687d6c7ee38', target: '4realmarketing' },
  { source: '5f23c8d2dcb2f680507cd0de', target: '4thstop' },
  { source: '5f3c84f67843524a6d1f1cb4', target: '536757864983856' },
  { source: '5f4ea360207ed04d8b615afe', target: '5amily' },
  { source: '5fd101fde80ac15bd94f92e7', target: '615nashlaw' },
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
