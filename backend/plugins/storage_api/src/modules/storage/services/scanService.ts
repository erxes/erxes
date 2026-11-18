import { IRfidTag, IScanProductRow, IScanSession } from '../@types/storage';
import { IModels } from '~/connectionResolvers';
import { LIMITS, normalizeEpcIds } from './validation';
import { requireZone } from './zoneService';

type TagSnapshot = Pick<IRfidTag, 'epcId' | 'productId' | 'zoneId' | 'status'>;

export type ScanDiff = Omit<IScanSession, 'zoneId' | 'userId'>;

const sample = (ids: string[]) => ids.slice(0, LIMITS.SCAN_SAMPLE);

/**
 * Compares what the antenna read with what the system expects in a zone.
 *
 * - matched: read, and sealed in this zone
 * - missing: sealed in this zone, but not read
 * - unknown: read, but not registered at all
 * - opened: read, but already moved to the open area
 * - otherZone: read, but sealed in a different zone
 */
export const diffScan = (
  zoneId: string,
  scannedEpcIds: string[],
  expectedSealed: TagSnapshot[],
  knownScanned: TagSnapshot[],
): ScanDiff => {
  const scanned = new Set(scannedEpcIds);
  const known = new Map(knownScanned.map((t) => [t.epcId, t]));

  const missing = expectedSealed.filter((t) => !scanned.has(t.epcId)).map((t) => t.epcId);
  const unknown = scannedEpcIds.filter((e) => !known.has(e));
  const opened = knownScanned.filter((t) => t.status === 'OPENED').map((t) => t.epcId);
  const otherZone = knownScanned.filter((t) => t.status === 'SEALED' && t.zoneId !== zoneId).map((t) => t.epcId);

  const rows = new Map<string, IScanProductRow>();
  expectedSealed.forEach((t) => {
    const row = rows.get(t.productId) || { productId: t.productId, expectedPacks: 0, scannedPacks: 0 };
    row.expectedPacks += 1;
    if (scanned.has(t.epcId)) row.scannedPacks += 1;
    rows.set(t.productId, row);
  });

  return {
    scannedCount: scannedEpcIds.length,
    matchedCount: expectedSealed.length - missing.length,
    missingCount: missing.length,
    unknownCount: unknown.length,
    openedCount: opened.length,
    otherZoneCount: otherZone.length,
    missingEpcIds: sample(missing),
    unknownEpcIds: sample(unknown),
    openedEpcIds: sample(opened),
    otherZoneEpcIds: sample(otherZone),
    products: [...rows.values()],
  };
};

/** Takes the EPC list read by the RFID reader for one zone and stores the comparison. */
export const submitScan = async (
  models: IModels,
  input: { zoneId: string; epcIds: string[] },
  userId?: string,
) => {
  await requireZone(models, input.zoneId);
  const epcIds = normalizeEpcIds(input.epcIds, LIMITS.MAX_SCAN_EPCS);

  const fields = { epcId: 1, productId: 1, zoneId: 1, status: 1 };
  const [expectedSealed, knownScanned] = await Promise.all([
    models.RfidTags.find({ zoneId: input.zoneId, status: 'SEALED' }).select(fields).lean(),
    models.RfidTags.find({ epcId: { $in: epcIds } }).select(fields).lean(),
  ]);

  const diff = diffScan(input.zoneId, epcIds, expectedSealed, knownScanned);
  const session = await models.ScanSessions.create({ ...diff, zoneId: input.zoneId, userId });
  return session.toObject();
};

/** Sealed and opened pack counts per product in a zone, straight from the tags. */
export const zoneSummary = async (models: IModels, zoneId: string) => {
  const rows = await models.RfidTags.aggregate<{
    _id: { productId: string; status: string };
    packs: number;
    units: number;
  }>([
    { $match: { zoneId } },
    { $group: { _id: { productId: '$productId', status: '$status' }, packs: { $sum: 1 }, units: { $sum: '$unitsInPack' } } },
  ]);

  const byProduct = new Map<string, { productId: string; sealedPacks: number; sealedUnits: number; openedPacks: number }>();
  rows.forEach((r) => {
    const row = byProduct.get(r._id.productId) || { productId: r._id.productId, sealedPacks: 0, sealedUnits: 0, openedPacks: 0 };
    if (r._id.status === 'SEALED') {
      row.sealedPacks = r.packs;
      row.sealedUnits = r.units;
    } else {
      row.openedPacks = r.packs;
    }
    byProduct.set(r._id.productId, row);
  });

  return [...byProduct.values()];
};
