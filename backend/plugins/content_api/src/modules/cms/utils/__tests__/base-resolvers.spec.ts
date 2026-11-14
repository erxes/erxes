import type { IContext } from '~/connectionResolvers';
import {
  BaseQueryArgs,
  BaseQueryResolver,
  FIELD_MAPPINGS,
} from '../base-resolvers';

// Mirrors defaultPaginate's offset logic without loading the shared bundle.
jest.mock('erxes-api-shared/utils', () => ({
  cursorPaginate: jest.fn(),
  defaultPaginate: (
    query: { limit: (n: number) => { skip: (n: number) => unknown } },
    { page = 1, perPage = 20 }: { page?: number; perPage?: number },
  ) => query.limit(perPage).skip((page - 1) * perPage),
}));

type Post = { _id: string; publishedDate: Date };
type SortSpec = Record<string, 1 | -1>;

// MongoDB leaves the order of documents that tie on every sort key
// unspecified; a different seeded shuffle per query reproduces that.
const shuffle = (posts: Post[], seed: number) => {
  const result = [...posts];
  let state = seed;
  for (let i = result.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) % 2147483648;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const createTieUnstableModel = (posts: Post[]) => {
  let scans = 0;
  const sorts: SortSpec[] = [];

  const find = () => {
    const scan = shuffle(posts, ++scans);
    let sortSpec: SortSpec = {};
    let limit = scan.length;
    let skip = 0;

    const query = {
      sort(spec: SortSpec) {
        sortSpec = spec;
        sorts.push(spec);
        return query;
      },
      lean: () => query,
      limit(value: number) {
        limit = value;
        return query;
      },
      skip(value: number) {
        skip = value;
        return query;
      },
      then(resolve: (rows: Post[]) => void) {
        const sorted = scan.sort((a, b) => {
          for (const [field, order] of Object.entries(sortSpec)) {
            const left = a[field as keyof Post];
            const right = b[field as keyof Post];
            if (left < right) return -order;
            if (left > right) return order;
          }
          return 0;
        });
        resolve(sorted.slice(skip, skip + limit));
      },
    };

    return query;
  };

  return { model: { find }, sorts };
};

class TestResolver extends BaseQueryResolver {
  page(model: unknown, args: BaseQueryArgs) {
    return this.getListWithDefaultPagination<Post>(
      model,
      {},
      args,
      FIELD_MAPPINGS.POST,
    );
  }
}

describe('getListWithDefaultPagination', () => {
  const sameDate = new Date('2024-09-30T16:00:00.000Z');
  const posts: Post[] = Array.from({ length: 30 }, (_, index) => ({
    _id: `post-${String(index).padStart(2, '0')}`,
    publishedDate: index < 24 ? sameDate : new Date(2025, 0, index),
  }));

  it('returns every post exactly once when sort values tie across pages', async () => {
    const { model, sorts } = createTieUnstableModel(posts);
    const resolver = new TestResolver({ models: {} } as unknown as IContext);

    const seen: string[] = [];
    for (let page = 1; page <= 3; page++) {
      const list = await resolver.page(model, {
        page,
        perPage: 12,
        sortField: 'publishedDate',
        sortDirection: 'desc',
      });
      seen.push(...list.map((post) => post._id));
    }

    expect(seen).toHaveLength(posts.length);
    expect(new Set(seen).size).toBe(posts.length);
    expect(sorts[0]).toEqual({ publishedDate: -1, _id: -1 });
  });

  it('breaks ties in the requested direction', async () => {
    const { model, sorts } = createTieUnstableModel(posts);
    const resolver = new TestResolver({ models: {} } as unknown as IContext);

    const list = await resolver.page(model, {
      page: 1,
      perPage: 3,
      sortField: 'publishedDate',
      sortDirection: 'asc',
    });

    expect(sorts[0]).toEqual({ publishedDate: 1, _id: 1 });
    expect(list.map((post) => post._id)).toEqual([
      'post-00',
      'post-01',
      'post-02',
    ]);
  });
});
