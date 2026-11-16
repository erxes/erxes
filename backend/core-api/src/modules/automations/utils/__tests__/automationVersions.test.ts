import {
  changedFlowNodeIds,
  flowContentHash,
  stableStringify,
  stepVersionsOf,
  versionAt,
} from '../automationVersions';

const action = (
  id: string,
  config: Record<string, unknown> = {},
  extra = {},
) => ({
  id,
  type: 'sendEmail',
  config,
  ...extra,
});

describe('stableStringify', () => {
  it('ignores key order', () => {
    expect(stableStringify({ b: 1, a: { d: 2, c: 3 } })).toBe(
      stableStringify({ a: { c: 3, d: 2 }, b: 1 }),
    );
  });

  it('drops undefined values', () => {
    expect(stableStringify({ a: 1, b: undefined })).toBe('{"a":1}');
  });
});

describe('flowContentHash', () => {
  it('stays the same when only nodes move on the canvas', () => {
    const before = {
      actions: [action('a1', { to: 'x' }, { position: { x: 0, y: 0 } })],
    };
    const after = {
      actions: [action('a1', { to: 'x' }, { position: { x: 90, y: 40 } })],
    };

    expect(flowContentHash(before)).toBe(flowContentHash(after));
  });

  it('changes when a config changes', () => {
    expect(flowContentHash({ actions: [action('a1', { to: 'x' })] })).not.toBe(
      flowContentHash({ actions: [action('a1', { to: 'y' })] }),
    );
  });
});

describe('changedFlowNodeIds', () => {
  it('lists every node for the first version', () => {
    expect(
      changedFlowNodeIds(null, { actions: [action('a1'), action('a2')] }),
    ).toEqual(['a1', 'a2']);
  });

  it('lists only the node whose config changed', () => {
    const previous = { actions: [action('a1', { to: 'x' }), action('a2')] };
    const next = { actions: [action('a1', { to: 'y' }), action('a2')] };

    expect(changedFlowNodeIds(previous, next)).toEqual(['a1']);
  });

  it('lists added and removed nodes', () => {
    const previous = { actions: [action('a1'), action('a2')] };
    const next = { actions: [action('a1'), action('a3')] };

    expect(changedFlowNodeIds(previous, next)).toEqual(['a3', 'a2']);
  });

  it('ignores a node that only moved', () => {
    const previous = { actions: [action('a1', {}, { position: { x: 0 } })] };
    const next = { actions: [action('a1', {}, { position: { x: 50 } })] };

    expect(changedFlowNodeIds(previous, next)).toEqual([]);
  });
});

describe('versionAt', () => {
  const marks = [
    { version: 1, createdAt: '2026-11-01T00:00:00Z' },
    { version: 2, createdAt: '2026-11-05T00:00:00Z' },
  ];

  it('picks the last version saved before the moment', () => {
    expect(versionAt(marks, '2026-11-03T00:00:00Z')).toBe(1);
    expect(versionAt(marks, '2026-11-06T00:00:00Z')).toBe(2);
  });

  it('has no version before the first one was kept', () => {
    expect(versionAt(marks, '2026-10-01T00:00:00Z')).toBeNull();
    expect(versionAt(marks, undefined)).toBeNull();
  });
});

describe('stepVersionsOf', () => {
  it('reads each step by its own start, so a resumed step sees the edit', () => {
    const marks = [
      { version: 1, createdAt: '2026-11-01T00:00:00Z' },
      { version: 2, createdAt: '2026-11-05T00:00:00Z' },
    ];

    expect(
      stepVersionsOf(
        marks,
        [
          { startedAt: '2026-11-02T00:00:00Z' },
          { startedAt: '2026-11-07T00:00:00Z' },
          {},
        ],
        '2026-11-02T00:00:00Z',
      ),
    ).toEqual([1, 2, 1]);
  });
});
