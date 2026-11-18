import { INTEGRATIONS } from '@/integrations/constants/integrations';
import type { TIntegrationEntry } from '@/integrations/hooks/useIntegrationEntries';
import { IntegrationType } from '@/types/Integration';
import { groupIntegrationKinds } from '../groupIntegrationKinds';

const entry = (type: keyof typeof INTEGRATIONS): TIntegrationEntry => ({
  type,
  ...INTEGRATIONS[type],
});

const ENTRIES = [
  entry(IntegrationType.ERXES_MESSENGER),
  entry(IntegrationType.MAIL),
  entry(IntegrationType.TELEGRAM_MESSENGER),
];

const needsAttention = (status?: string | null) =>
  Boolean(status) && status !== 'healthy';

describe('groupIntegrationKinds', () => {
  it('puts every kind under available when the channel has no integrations', () => {
    const { connected, available } = groupIntegrationKinds(
      ENTRIES,
      [],
      needsAttention,
    );

    expect(connected).toEqual([]);
    expect(available.map((kind) => kind.type)).toEqual([
      IntegrationType.ERXES_MESSENGER,
      IntegrationType.MAIL,
      IntegrationType.TELEGRAM_MESSENGER,
    ]);
    expect(available.every((kind) => kind.count === 0)).toBe(true);
  });

  it('counts integrations per kind and keeps the catalogue order', () => {
    const { connected, available } = groupIntegrationKinds(
      ENTRIES,
      [
        { kind: IntegrationType.MAIL },
        { kind: IntegrationType.ERXES_MESSENGER },
        { kind: IntegrationType.MAIL },
      ],
      needsAttention,
    );

    expect(connected.map(({ type, count }) => [type, count])).toEqual([
      [IntegrationType.ERXES_MESSENGER, 1],
      [IntegrationType.MAIL, 2],
    ]);
    expect(available.map((kind) => kind.type)).toEqual([
      IntegrationType.TELEGRAM_MESSENGER,
    ]);
  });

  it('flags a kind when any of its integrations is unhealthy', () => {
    const { connected } = groupIntegrationKinds(
      ENTRIES,
      [
        { kind: IntegrationType.MAIL, healthStatus: { status: 'healthy' } },
        { kind: IntegrationType.MAIL, healthStatus: { status: 'error' } },
        { kind: IntegrationType.ERXES_MESSENGER, healthStatus: null },
      ],
      needsAttention,
    );

    expect(
      connected.map(({ type, needsAttention: flagged }) => [type, flagged]),
    ).toEqual([
      [IntegrationType.ERXES_MESSENGER, false],
      [IntegrationType.MAIL, true],
    ]);
  });

  it('ignores kinds that are not in the catalogue', () => {
    const { connected, available } = groupIntegrationKinds(
      ENTRIES,
      [{ kind: 'unknown-provider' }],
      needsAttention,
    );

    expect(connected).toEqual([]);
    expect(available).toHaveLength(ENTRIES.length);
  });
});
