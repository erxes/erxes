import { IMailCloudflareZone } from '@/integrations/mail/@types/cloudflare';
import { debugError } from '@/integrations/mail/debuggers';
import { listMxRecords } from '@/integrations/mail/utils/cloudflare/api';

const CLOUDFLARE_MX = /\.mx\.cloudflare\.net\.?$/i;

// An account can carry hundreds of zones and each one costs an MX lookup, so the
// listing walks them a handful at a time rather than opening every connection at
// once.
const ELIGIBILITY_CONCURRENCY = 10;

export const foreignMailHost = async (
  token: string,
  zoneId: string,
  zoneName: string,
) => {
  const records = await listMxRecords(token, zoneId);

  const foreign = (records ?? []).find(
    (record) =>
      record.name === zoneName && !CLOUDFLARE_MX.test(record.content ?? ''),
  );

  return foreign?.content;
};

export const inactiveZoneReason = (name: string, status: string) =>
  status === 'active'
    ? undefined
    : `${name} is ${status} on Cloudflare — it must be active before mail can be routed`;

export const foreignMailReason = (name: string, host: string) =>
  `${name} already receives its mail through ${host}. Connecting it would replace those MX records with Cloudflare Email Routing and stop every message to that domain — including everyone's mailbox on it. Use a domain dedicated to erxes mail instead.`;

// The picker repeats these tests for every zone, so its wording has to stay short
// enough to sit under a domain name. The long form above belongs to the error
// `checkZone` throws, where there is room to explain the consequence.
const inactiveSummary = (status: string) => `Zone is ${status}, not active`;

const foreignMailSummary = (host: string) => `Mail already goes to ${host}`;

// The picker is a hint, never the gate: `checkZone` runs the same two tests
// against live data when the workspace actually connects. So a zone whose MX
// cannot be read — a token without DNS read, a Cloudflare hiccup — stays
// selectable rather than being wrongly withheld.
const readZoneEligibility = async (
  token: string,
  zone: IMailCloudflareZone,
): Promise<IMailCloudflareZone> => {
  if (zone.status !== 'active') {
    return { ...zone, eligible: false, reason: inactiveSummary(zone.status) };
  }

  try {
    const host = await foreignMailHost(token, zone.id, zone.name);

    return host
      ? { ...zone, eligible: false, reason: foreignMailSummary(host) }
      : { ...zone, eligible: true };
  } catch (e) {
    debugError(`Could not read the MX records of ${zone.name}:`, e);

    return { ...zone, eligible: true };
  }
};

const byUsableThenName = (a: IMailCloudflareZone, b: IMailCloudflareZone) => {
  if (a.eligible !== b.eligible) {
    return a.eligible ? -1 : 1;
  }

  return a.name.localeCompare(b.name);
};

export const describeZones = async (
  token: string,
  zones: IMailCloudflareZone[],
): Promise<IMailCloudflareZone[]> => {
  const described: IMailCloudflareZone[] = new Array(zones.length);
  let cursor = 0;

  const walk = async () => {
    while (cursor < zones.length) {
      const index = cursor++;

      described[index] = await readZoneEligibility(token, zones[index]);
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(ELIGIBILITY_CONCURRENCY, zones.length) },
      walk,
    ),
  );

  return described.sort(byUsableThenName);
};
