import { installedPathOf } from '@/template/utils/installedPath';

describe('installedPathOf', () => {
  it('Opens a lone automation in the builder', () => {
    expect(
      installedPathOf(
        { group: 'automation' },
        { _id: 'i1', automationIds: { chat: 'a1' } },
      ),
    ).toBe('/automations/edit/a1');
  });

  it('Opens the segment a segment template made', () => {
    expect(
      installedPathOf({ group: 'segment' }, { _id: 'i1', partIds: { s: 'g1' } }),
    ).toBe('/segments/g1');
  });

  it('Shows what a solution made on its installation page', () => {
    expect(
      installedPathOf(
        { group: 'solution' },
        { _id: 'i1', automationIds: { a: 'a1', b: 'a2' } },
      ),
    ).toBe('/templates/installations/i1?installed=1');
  });
});
