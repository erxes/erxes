import { act, renderHook } from '@testing-library/react';
import type { IArticleDoc } from '@/knowledgebase/types';
import { useSaveArticle } from '../useArticleMutations';

const mockQuery = jest.fn();
const mockAdd = jest.fn();
const mockEdit = jest.fn();
jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({ query: mockQuery }),
  useMutation: (document: string) => [
    document === 'add' ? mockAdd : mockEdit,
    { loading: false },
  ],
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => ({
  isDefined: (value: unknown) => value !== null && value !== undefined,
}));
jest.mock('@/knowledgebase/shared/hooks/useKbCloseRemovedRecord', () => ({
  useKbCloseRemovedRecord: () => jest.fn(),
}));
jest.mock('@/knowledgebase/shared/hooks/useKbToast', () => ({
  useKbToast: () => ({
    run: async (action: () => Promise<unknown>) => {
      await action();
      return true;
    },
  }),
}));
jest.mock('@/knowledgebase/graphql/mutations', () => ({
  ADD_ARTICLE: 'add',
  EDIT_ARTICLE: 'edit',
}));
jest.mock('@/knowledgebase/graphql/queries', () => ({
  ARTICLE_DETAIL: 'detail',
}));

const values: IArticleDoc = {
  title: 'Edited title',
  content: '<p>Stale content</p>',
  status: 'draft',
  categoryId: 'category-1',
  topicId: 'topic-1',
  isPrivate: false,
  reactionChoices: ['happy'],
  summary: 'Old summary',
  attachments: [],
};
beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({
    data: {
      knowledgeBaseArticleDetail: {
        _id: 'article-1',
        title: 'Current title',
        content: '<p>Current content</p>',
        status: 'publish',
        summary: 'Concurrent summary',
        categoryId: 'category-2',
      },
    },
  });
  mockAdd.mockResolvedValue({
    data: { knowledgeBaseArticlesAdd: { _id: 'created-1' } },
  });
  mockEdit.mockResolvedValue({});
});

it('edits only dirty fields and refreshes required fields without reverting a concurrent inline status', async () => {
  const { result } = renderHook(useSaveArticle);
  await act(async () => {
    await result.current.saveArticle(values, 'article-1', { title: true });
  });
  expect(mockQuery).toHaveBeenCalledWith({
    query: 'detail',
    variables: { _id: 'article-1' },
    fetchPolicy: 'network-only',
  });
  expect(mockEdit).toHaveBeenCalledWith({
    variables: {
      _id: 'article-1',
      doc: {
        title: 'Edited title',
        content: '<p>Current content</p>',
        status: 'publish',
      },
    },
  });
});

it('sends explicit clears and whole changed media while omitting untouched media', async () => {
  const { result } = renderHook(useSaveArticle);
  await act(async () => {
    await result.current.saveArticle(
      {
        ...values,
        image: undefined,
        pdfAttachment: undefined,
        summary: '',
        reactionChoices: [],
        attachments: [{ url: 'new-file', name: 'New' }],
      },
      'article-1',
      {
        image: { url: true },
        pdfAttachment: { pdf: { url: true } },
        summary: true,
        reactionChoices: [true],
        attachments: [{ url: true }],
      },
    );
  });
  expect(mockEdit).toHaveBeenCalledWith({
    variables: {
      _id: 'article-1',
      doc: {
        title: 'Current title',
        content: '<p>Current content</p>',
        status: 'publish',
        image: null,
        pdfAttachment: null,
        summary: '',
        reactionChoices: [],
        attachments: [{ url: 'new-file', name: 'New' }],
      },
    },
  });
});

it('retains the complete create payload and returns the new identifier', async () => {
  const { result } = renderHook(useSaveArticle);
  let saved: unknown;
  await act(async () => {
    saved = await result.current.saveArticle(values);
  });
  expect(mockQuery).not.toHaveBeenCalled();
  expect(mockAdd).toHaveBeenCalledWith({ variables: { doc: values } });
  expect(saved).toBe('created-1');
});

it('preserves the current schedule required by a concurrent scheduled status', async () => {
  mockQuery.mockResolvedValue({
    data: {
      knowledgeBaseArticleDetail: {
        title: 'Title',
        content: 'Content',
        status: 'scheduled',
        scheduledDate: '2030-01-01T00:00:00Z',
      },
    },
  });
  const { result } = renderHook(useSaveArticle);
  await act(async () => {
    await result.current.saveArticle(values, 'article-1', { title: true });
  });
  expect(mockEdit).toHaveBeenCalledWith({
    variables: {
      _id: 'article-1',
      doc: {
        title: 'Edited title',
        content: 'Content',
        status: 'scheduled',
        scheduledDate: '2030-01-01T00:00:00Z',
      },
    },
  });
});

it('omits nested media fields whose dirty flags have all returned to false', async () => {
  const { result } = renderHook(useSaveArticle);
  await act(async () => {
    await result.current.saveArticle(
      { ...values, image: { url: 'stale', name: 'Old' } },
      'article-1',
      { title: true, image: { url: false, name: false } },
    );
  });
  expect(mockEdit).toHaveBeenCalledWith({
    variables: {
      _id: 'article-1',
      doc: {
        title: 'Edited title',
        content: '<p>Current content</p>',
        status: 'publish',
      },
    },
  });
});

it.each([
  {
    status: 'scheduled',
    dirtyFields: { status: true },
    expected: '2031-01-01T00:00:00Z',
  },
  {
    status: 'scheduled',
    dirtyFields: { scheduledDate: true },
    expected: '2031-01-01T00:00:00Z',
  },
  { status: 'draft', dirtyFields: { status: true }, expected: null },
] as const)(
  'updates the schedule for a dirty $dirtyFields field with status $status',
  async ({ status, dirtyFields, expected }) => {
    mockQuery.mockResolvedValue({
      data: {
        knowledgeBaseArticleDetail: {
          title: 'Current title',
          content: 'Current content',
          status: 'scheduled',
          scheduledDate: '2030-01-01T00:00:00Z',
        },
      },
    });
    const { result } = renderHook(useSaveArticle);
    await act(async () => {
      await result.current.saveArticle(
        { ...values, status, scheduledDate: '2031-01-01T00:00:00Z' },
        'article-1',
        dirtyFields,
      );
    });
    expect(mockEdit).toHaveBeenCalledWith({
      variables: {
        _id: 'article-1',
        doc: {
          title: 'Current title',
          content: 'Current content',
          status,
          scheduledDate: expected,
        },
      },
    });
  },
);
