import { promises as dns } from 'node:dns';

const clean = (name: string) => name.toLowerCase().replace(/\.$/, '');

/**
 * Whether `hostname` CNAMEs to `target`. Apex domains served through CNAME
 * flattening have no CNAME to read, so callers also treat an active
 * Cloudflare hostname as proof the records are in place.
 */
export const pointsTo = async (hostname: string, target: string) => {
  try {
    const records = await dns.resolveCname(hostname);

    return records.map(clean).includes(clean(target));
  } catch {
    return false;
  }
};
