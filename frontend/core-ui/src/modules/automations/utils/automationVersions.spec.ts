import {
  configChangesOf,
  humanizeKey,
  nodeInVersion,
  previewOf,
  previousVersionOf,
  restoreSummaryOf,
  versionsOfNode,
} from './automationVersions';

const version = (n: number, changedNodeIds: string[]) => ({
  _id: `v${n}`,
  automationId: 'a',
  version: n,
  changedNodeIds,
});

describe('configChangesOf', () => {
  it('lists only the keys that differ, named for reading', () => {
    expect(
      configChangesOf(
        { id: 'a1', config: { replyTo: 'x', subject: 'Hi' } },
        { id: 'a1', config: { replyTo: 'y', subject: 'Hi' } },
      ),
    ).toEqual([
      {
        key: 'replyTo',
        label: 'Reply to',
        before: { kind: 'text', text: 'x' },
        after: { kind: 'text', text: 'y' },
      },
    ]);
  });

  it('shows an added key against an empty value', () => {
    const [change] = configChangesOf(
      { id: 'a1', config: {} },
      { id: 'a1', config: { cc: 'z' } },
    );

    expect(change.before).toEqual({ kind: 'empty' });
  });
});

describe('previewOf', () => {
  it('summarizes what a value is instead of its JSON', () => {
    expect(previewOf({ type: 'doc', content: [{}, {}, {}] })).toEqual({
      kind: 'document',
      blocks: 3,
    });
    expect(previewOf(['a', 'b'])).toEqual({ kind: 'list', count: 2 });
    expect(previewOf('<p>hi</p>')).toEqual({ kind: 'html', kilobytes: 1 });
    expect(previewOf(true)).toEqual({ kind: 'boolean', value: true });
  });

  it('shortens long text', () => {
    const preview = previewOf('x'.repeat(200));

    expect(preview.kind === 'text' && preview.text.length).toBe(81);
  });
});

describe('humanizeKey', () => {
  it('reads camel and snake case as words', () => {
    expect(humanizeKey('replyToEmail')).toBe('Reply to email');
    expect(humanizeKey('reply_to_email')).toBe('Reply to email');
  });
});

describe('restoreSummaryOf', () => {
  it('says per step what a restore does', () => {
    const current = {
      actions: [
        { id: 'a1', label: 'Email', config: { to: 'x' } },
        { id: 'a2', label: 'Ticket', config: {} },
      ],
    };
    const restored = {
      actions: [
        { id: 'a1', label: 'Email', config: { to: 'y' } },
        { id: 'a3', label: 'Wait', config: {} },
      ],
    };

    expect(
      restoreSummaryOf(current, restored).map(
        ({ id, status, changedFields }) => [id, status, changedFields],
      ),
    ).toEqual([
      ['a1', 'changed', 1],
      ['a3', 'added', 0],
      ['a2', 'removed', 0],
    ]);
  });

  it('counts a step whose only change is where it leads', () => {
    const [row] = restoreSummaryOf(
      { actions: [{ id: 'a1', nextActionId: 'a2' }] },
      { actions: [{ id: 'a1', nextActionId: 'a3' }] },
    );

    expect([row.status, row.changedFields]).toEqual(['changed', 0]);
  });
});

describe('version lookups', () => {
  const versions = [
    version(3, ['a1']),
    version(2, ['t1']),
    version(1, ['a1', 't1']),
  ];

  it('keeps the versions a node changed in', () => {
    expect(
      versionsOfNode(versions, 'a1').map(({ version }) => version),
    ).toEqual([3, 1]);
  });

  it('finds the version just before', () => {
    expect(previousVersionOf(versions, 3)?._id).toBe('v2');
    expect(previousVersionOf(versions, 1)).toBeUndefined();
  });

  it('finds a node in any part of a flow', () => {
    expect(
      nodeInVersion(
        { triggers: [{ id: 't1' }], workflows: [{ id: 'w1' }] },
        'w1',
      )?.id,
    ).toBe('w1');
  });
});
