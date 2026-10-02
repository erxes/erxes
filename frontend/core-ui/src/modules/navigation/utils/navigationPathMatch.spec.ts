import {
  findActiveNavigationPath,
  getNavigationPathMatchScore,
} from '@/navigation/utils/navigationPathMatch';

describe('navigation path match', () => {
  it('matches the path itself and the pages under it, not lookalikes', () => {
    expect(
      getNavigationPathMatchScore('contacts/leads', {
        pathname: '/contacts/leads/123',
        search: '',
      }),
    ).toBeGreaterThan(-1);
    expect(
      getNavigationPathMatchScore('contacts/leads', {
        pathname: '/contacts/leadership',
        search: '',
      }),
    ).toBe(-1);
  });

  it('prefers the query-scoped view over the bare path it extends', () => {
    const paths = ['automations', 'automations?view=templates'];

    expect(
      findActiveNavigationPath(paths, {
        pathname: '/automations',
        search: '?view=templates',
      }),
    ).toBe('automations?view=templates');
    expect(
      findActiveNavigationPath(paths, {
        pathname: '/automations',
        search: '',
      }),
    ).toBe('automations');
  });

  it('gives an overview entry way to the section the location is in', () => {
    expect(
      findActiveNavigationPath(
        ['/settings/structures', '/settings/structures/units'],
        { pathname: '/settings/structures/units', search: '' },
      ),
    ).toBe('/settings/structures/units');
  });

  it('keeps a list active on its detail pages', () => {
    expect(
      findActiveNavigationPath(
        ['/settings/automations/agents', '/settings/automations/bots'],
        { pathname: '/settings/automations/bots/facebook', search: '' },
      ),
    ).toBe('/settings/automations/bots');
  });

  it('finds nothing when no path matches', () => {
    expect(
      findActiveNavigationPath(['/settings/team/members'], {
        pathname: '/settings/general',
        search: '',
      }),
    ).toBeUndefined();
  });
});
