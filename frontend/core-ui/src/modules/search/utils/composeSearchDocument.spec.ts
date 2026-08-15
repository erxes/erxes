import { print } from 'graphql';
import { ISearchProvider } from 'erxes-ui';
import {
  buildGlobalSearchDocument,
  buildGlobalSearchPageDocument,
} from '@/search/utils/composeSearchDocument';

const createProvider = (key: string, alias: string): ISearchProvider => ({
  key,
  label: key,
  selections: [
    {
      alias,
      field: `${key}Search`,
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward',
      body: '{ list { _id } pageInfo { hasNextPage endCursor } }',
    },
  ],
  resolve: () => ({
    items: [],
    totalCount: 0,
    countMode: 'exact',
    pageInfo: { hasNextPage: false, endCursor: null },
  }),
});

describe('global search document composition', () => {
  const projects = createProvider('projects', 'gs_operation_projects');
  const tasks = createProvider('tasks', 'gs_operation_tasks');

  it('includes the shared cursor variable in the all-provider query', () => {
    const source = print(buildGlobalSearchDocument([projects, tasks]));

    expect(source).toContain('query GlobalSearch(');
    expect(source).toContain('$cursor: String');
    expect(source).toContain('gs_operation_projects');
    expect(source).toContain('gs_operation_tasks');
  });

  it('builds a page query for only the requested provider', () => {
    const source = print(buildGlobalSearchPageDocument(projects));

    expect(source).toContain('query GlobalSearchPage(');
    expect(source).toContain('gs_operation_projects');
    expect(source).not.toContain('gs_operation_tasks');
  });
});
