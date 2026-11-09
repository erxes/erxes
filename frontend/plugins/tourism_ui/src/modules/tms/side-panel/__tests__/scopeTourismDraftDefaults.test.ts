import { scopeTourismDraftDefaults } from '../tourismRecordPage';

describe('scopeTourismDraftDefaults', () => {
  it('keeps a draft opened in the route branch', () => {
    expect(
      scopeTourismDraftDefaults(
        { branchId: 'branch-a', groupId: 'group-a' },
        'branch-a',
      ),
    ).toEqual({ branchId: 'branch-a', groupId: 'group-a' });
  });

  it('drops a draft opened in another branch', () => {
    expect(
      scopeTourismDraftDefaults(
        { branchId: 'branch-a', groupId: 'group-a' },
        'branch-b',
      ),
    ).toEqual({ branchId: 'branch-b' });
  });

  it('falls back to the route branch when the draft has none', () => {
    expect(
      scopeTourismDraftDefaults({ groupId: 'group-a' }, 'branch-b'),
    ).toEqual({ branchId: 'branch-b', groupId: 'group-a' });
  });

  it('keeps the draft branch outside a branch route', () => {
    expect(scopeTourismDraftDefaults({ branchId: 'branch-a' }, '')).toEqual({
      branchId: 'branch-a',
    });
  });
});
