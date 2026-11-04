import { act, renderHook } from '@testing-library/react';
import { useSaveCategory } from '@/knowledgebase/categories/hooks/useCategoryMutations';
import { useSaveTopic } from '@/knowledgebase/topics/hooks/useTopicMutations';

const mockQuery = jest.fn();
const mockWrite = jest.fn();
jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({ query: mockQuery }),
  useMutation: () => [mockWrite, { loading: false }],
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => ({ useToast: () => ({ toast: jest.fn() }) }));
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
  ADD_CATEGORY: 'addCategory',
  EDIT_CATEGORY: 'editCategory',
  ADD_TOPIC: 'addTopic',
  EDIT_TOPIC: 'editTopic',
}));
jest.mock('@/knowledgebase/graphql/queries', () => ({
  CATEGORY_DETAIL: 'category',
  TOPIC_DETAIL: 'topic',
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockWrite.mockResolvedValue({});
});

it('saves a category description without reverting a newer title, icon or placement', async () => {
  mockQuery.mockResolvedValue({
    data: {
      knowledgeBaseCategoryDetail: {
        _id: 'category-1',
        title: 'Inline title',
        icon: 'rocket',
        firstTopic: { _id: 'topic-2' },
        parentCategoryId: 'new-parent',
      },
    },
  });
  const { result } = renderHook(useSaveCategory);
  await act(async () => {
    await result.current.saveCategory(
      {
        title: 'Old title',
        icon: 'book',
        topicId: 'topic-1',
        description: 'Edited description',
        parentCategoryId: 'old-parent',
      },
      'category-1',
      { description: true },
    );
  });
  expect(mockWrite).toHaveBeenCalledWith({
    variables: {
      _id: 'category-1',
      doc: {
        title: 'Inline title',
        icon: 'rocket',
        description: 'Edited description',
      },
    },
  });
});

it('persists an explicitly cleared category description and parent', async () => {
  mockQuery.mockResolvedValue({
    data: {
      knowledgeBaseCategoryDetail: {
        _id: 'category-1',
        title: 'Current',
        icon: 'book',
      },
    },
  });
  const { result } = renderHook(useSaveCategory);
  await act(async () => {
    await result.current.saveCategory(
      {
        title: 'Old',
        icon: 'book',
        topicId: 'topic-1',
        description: '',
        parentCategoryId: '',
      },
      'category-1',
      { description: true, parentCategoryId: true },
    );
  });
  expect(mockWrite).toHaveBeenCalledWith({
    variables: {
      _id: 'category-1',
      doc: {
        title: 'Current',
        icon: 'book',
        description: '',
        parentCategoryId: '',
      },
    },
  });
});

it('saves a topic title without reverting a newer color or brand', async () => {
  mockQuery.mockResolvedValue({
    data: {
      knowledgeBaseTopicDetail: {
        _id: 'topic-1',
        title: 'Current',
        color: '#000000',
        brand: { _id: 'new-brand' },
      },
    },
  });
  const { result } = renderHook(useSaveTopic);
  await act(async () => {
    await result.current.saveTopic(
      {
        title: 'Edited title',
        color: '#ffffff',
        brandId: 'old-brand',
        backgroundImage: 'old-image',
      },
      'topic-1',
      { title: true },
    );
  });
  expect(mockWrite).toHaveBeenCalledWith({
    variables: {
      _id: 'topic-1',
      doc: { title: 'Edited title' },
    },
  });
});

it('uses the current required topic title and preserves explicit appearance clears', async () => {
  mockQuery.mockResolvedValue({
    data: { knowledgeBaseTopicDetail: { _id: 'topic-1', title: 'New title' } },
  });
  const { result } = renderHook(useSaveTopic);
  await act(async () => {
    await result.current.saveTopic(
      { title: 'Old', description: '', backgroundImage: '' },
      'topic-1',
      {
        description: true,
        backgroundImage: true,
      },
    );
  });
  expect(mockWrite).toHaveBeenCalledWith({
    variables: {
      _id: 'topic-1',
      doc: { title: 'New title', description: '', backgroundImage: '' },
    },
  });
});
