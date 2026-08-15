import { TGlobalSearchGroup } from '@/search/types/GlobalSearch';
import {
  appendUniqueSearchItems,
  buildGlobalSearchCategories,
  getGlobalSearchRequestState,
  getMaterializedGlobalSearchTotalCount,
} from '@/search/utils/globalSearchResults';

const createGroup = (
  overrides: Partial<TGlobalSearchGroup>,
): TGlobalSearchGroup => ({
  key: 'projects',
  label: 'Projects',
  status: 'ok',
  items: [{ id: 'project-1', title: 'Project one', path: '/projects/1' }],
  totalCount: 1,
  countMode: 'exact',
  pageInfo: { hasNextPage: false, endCursor: null },
  loadingMore: false,
  loadMoreError: false,
  ...overrides,
});

describe('global search categories', () => {
  it('keeps Go to second and includes only non-empty provider groups', () => {
    const categories = buildGlobalSearchCategories({
      hasSearchValue: true,
      goToItemCount: 2,
      groups: [
        createGroup({}),
        createGroup({ key: 'tickets', label: 'Tickets', items: [] }),
        createGroup({ key: 'forms', label: 'Forms', status: 'error' }),
      ],
    });

    expect(categories.map(({ key }) => key)).toEqual([
      'all',
      'go-to',
      'projects',
    ]);
  });

  it('keeps Go to available before a search starts', () => {
    expect(
      buildGlobalSearchCategories({
        hasSearchValue: false,
        goToItemCount: 2,
        groups: [createGroup({})],
      }),
    ).toEqual([
      { key: 'all', label: 'All' },
      { key: 'go-to', label: 'Go to' },
    ]);
  });
});

describe('global search result pagination', () => {
  it('appends a page without duplicating an item already loaded', () => {
    expect(
      appendUniqueSearchItems(
        [
          { id: 'project-1', title: 'Project one', path: '/projects/1' },
          { id: 'project-2', title: 'Project two', path: '/projects/2' },
        ],
        [
          { id: 'project-2', title: 'Project two', path: '/projects/2' },
          { id: 'project-3', title: 'Project three', path: '/projects/3' },
        ],
      ),
    ).toEqual([
      { id: 'project-1', title: 'Project one', path: '/projects/1' },
      { id: 'project-2', title: 'Project two', path: '/projects/2' },
      { id: 'project-3', title: 'Project three', path: '/projects/3' },
    ]);
  });
});

describe('global search result count', () => {
  it('counts materialized items without using provider totals or category', () => {
    const groups: TGlobalSearchGroup[] = [
      {
        key: 'projects',
        label: 'Projects',
        status: 'ok',
        items: [
          {
            id: 'project-1',
            title: 'Project one',
            path: '/projects/1',
          },
        ],
        totalCount: 240,
        countMode: 'exact',
        pageInfo: { hasNextPage: true, endCursor: 'next-project' },
        loadingMore: false,
        loadMoreError: false,
      },
    ];

    expect(
      getMaterializedGlobalSearchTotalCount({
        goToItems: [
          {
            id: 'go-to:projects',
            activityId: 'operation',
            title: 'Projects',
            path: '/projects',
          },
          {
            id: 'plugin:operation',
            activityId: 'operation',
            title: 'Operation',
            path: '/operation',
          },
        ],
        groups,
      }),
    ).toBe(3);
  });
});

describe('global search request state', () => {
  it('keeps a stale-schema validation response in loading while providers recover', () => {
    expect(
      getGlobalSearchRequestState({
        skipped: false,
        queryLoading: false,
        hasError: true,
        hasData: false,
        hasInvalidFields: true,
        canQuarantineFields: true,
      }),
    ).toEqual({ loading: true, hasFailure: false });
  });

  it('reveals the failure when schema recovery is exhausted', () => {
    expect(
      getGlobalSearchRequestState({
        skipped: false,
        queryLoading: false,
        hasError: true,
        hasData: false,
        hasInvalidFields: true,
        canQuarantineFields: false,
      }),
    ).toEqual({ loading: false, hasFailure: true });
  });
});
