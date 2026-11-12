import { describe, expect, it } from 'vite-plus/test';
import { formatBatch } from '~/modules/audit/streamFormat';

const entry = {
  id: 'a1',
  seq: 7,
  prevHash: 'p',
  hash: 'h',
  createdAt: '2026-11-12T00:00:00.000Z',
  source: 'core',
  action: 'customer.deleted',
  actor: { type: 'user' as const, id: 'u1' },
  target: { type: 'customer', id: 'c1', label: 'Bat' },
  changes: null,
  metadata: null,
  ip: '1.2.3.4',
  userAgent: null,
};

const context = { streamId: 's1', organization: { id: 'o1', subdomain: 'acme' } };
const gap = { fromSeq: 3, toSeq: 6 };
const parsed = (text: string): unknown => JSON.parse(text);

describe('audit stream formats', () => {
  it('speaks erxes, with the gap and the hash chain', () => {
    expect(parsed(formatBatch('erxes', context, [entry], gap))).toMatchObject({
      stream: 's1',
      gap,
      entries: [{ seq: 7, hash: 'h', prevHash: 'p' }],
    });
  });

  it('speaks Datadog, with the gap as its own log line', () => {
    expect(parsed(formatBatch('datadog', context, [entry], gap))).toMatchObject([
      { erxes: { action: 'audit.stream_gap', metadata: gap } },
      {
        ddsource: 'erxes',
        hostname: 'acme',
        message: 'customer.deleted Bat',
        timestamp: Date.parse(entry.createdAt),
      },
    ]);
  });

  it('speaks Splunk HEC, one event per line', () => {
    const lines = formatBatch('splunk', context, [entry], null).split('\n').map(parsed);

    expect(lines).toEqual([
      {
        time: Date.parse(entry.createdAt) / 1000,
        host: 'acme',
        source: 'erxes',
        sourcetype: 'erxes:audit',
        event: entry,
      },
    ]);
  });
});
