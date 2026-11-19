/**
 * What the import did, per source collection: documents seen, rows copied, and every skip with
 * its reason and up to five example ids. Collections left out on purpose are listed with why.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const EXAMPLES = 5;

interface Tally {
  count: number;
  examples: string[];
}

export interface Entry {
  collection: string;
  /** Tables it went to, or `plugin:<name>` / `left out`. */
  target: string;
  seen: number;
  copied: number;
  skipped: Record<string, Tally>;
  /** Copied rows that changed on the way (a demoted email, a suffixed code). */
  notes: Record<string, Tally>;
}

const tally = (tallies: Record<string, Tally>, reason: string, id: string, count = 1) => {
  const entry = tallies[reason] ?? { count: 0, examples: [] };

  entry.count += count;

  if (entry.examples.length < EXAMPLES && id && !entry.examples.includes(id)) {
    entry.examples.push(id);
  }

  tallies[reason] = entry;
};

export class Report {
  readonly entries = new Map<string, Entry>();

  /** The entry for `collection`, made on first use. */
  of(collection: string, target = '') {
    const existing = this.entries.get(collection);

    if (existing) {
      if (target && !existing.target.includes(target)) {
        existing.target = existing.target ? `${existing.target}, ${target}` : target;
      }

      return existing;
    }

    const entry: Entry = { collection, target, seen: 0, copied: 0, skipped: {}, notes: {} };

    this.entries.set(collection, entry);

    return entry;
  }

  seen(collection: string, count = 1) {
    this.of(collection).seen += count;
  }

  copied(collection: string, count: number) {
    this.of(collection).copied += count;
  }

  skip(collection: string, reason: string, id = '', count = 1) {
    tally(this.of(collection).skipped, reason, id, count);
  }

  note(collection: string, reason: string, id = '', count = 1) {
    tally(this.of(collection).notes, reason, id, count);
  }

  /** A collection imported by no one here: why, and how many documents it holds. */
  leftOut(collection: string, target: string, documents: number, reason: string) {
    const entry = this.of(collection, target);

    entry.seen = documents;

    if (documents > 0) tally(entry.skipped, reason, '', documents);
    else tally(entry.notes, reason, '', 0);
  }

  lines() {
    const rows = [...this.entries.values()].toSorted((a, b) =>
      a.collection.localeCompare(b.collection),
    );

    return rows.flatMap((entry) => [
      `${entry.collection.padEnd(44)} ${String(entry.seen).padStart(9)} seen ${String(entry.copied).padStart(9)} copied  → ${entry.target}`,
      ...Object.entries(entry.skipped).map(
        ([reason, { count, examples }]) =>
          `    skipped ${count}: ${reason}${examples.length ? ` (${examples.join(', ')})` : ''}`,
      ),
      ...Object.entries(entry.notes).map(
        ([reason, { count, examples }]) =>
          `    note ${count}: ${reason}${examples.length ? ` (${examples.join(', ')})` : ''}`,
      ),
    ]);
  }

  save(path: string, extra: Record<string, unknown>) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(
      path,
      `${JSON.stringify({ ...extra, collections: [...this.entries.values()] }, null, 2)}\n`,
    );
  }
}
