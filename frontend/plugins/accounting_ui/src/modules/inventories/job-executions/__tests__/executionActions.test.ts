import { canRunExecutionAction, runExecutionAction } from '../executionActions';

test('action eligibility respects state, parent linkage and separate permissions', () => {
  const draft = { _id: 'draft', status: 'draft', parentId: null };
  const posted = { _id: 'posted', status: 'posted', parentId: 'parent' };
  expect(canRunExecutionAction('post', draft, true, false)).toBe(true);
  expect(canRunExecutionAction('post', posted, true, true)).toBe(false);
  expect(
    canRunExecutionAction('post', { ...draft, parentId: 'parent' }, true, true),
  ).toBe(false);
  expect(canRunExecutionAction('remove', draft, false, true)).toBe(true);
  expect(canRunExecutionAction('remove', posted, false, true)).toBe(false);
  expect(canRunExecutionAction('remove', posted, true, false)).toBe(false);
  expect(canRunExecutionAction('remove', posted, true, true)).toBe(true);
  expect(canRunExecutionAction('undo', posted, true, false)).toBe(true);
  for (const status of ['posting', 'undoing']) {
    for (const action of ['post', 'undo', 'remove'] as const)
      expect(
        canRunExecutionAction(action, { ...draft, status }, true, true),
      ).toBe(false);
  }
});

test.each(['posted', 'error'])(
  'deleting %s executions awaits undo before deleting',
  async (status) => {
    const write = jest.fn().mockResolvedValue(undefined);
    await runExecutionAction(
      'remove',
      { _id: 'execution', status, parentId: 'parent' },
      write,
    );
    expect(write.mock.calls).toEqual([
      ['undo', 'execution'],
      ['remove', 'execution'],
    ]);
  },
);

test('undo failure prevents deletion', async () => {
  const write = jest.fn().mockRejectedValue(new Error('Denied'));
  await expect(
    runExecutionAction(
      'remove',
      { _id: 'execution', status: 'posted', parentId: 'parent' },
      write,
    ),
  ).rejects.toThrow('Denied');
  expect(write).toHaveBeenCalledTimes(1);
});
