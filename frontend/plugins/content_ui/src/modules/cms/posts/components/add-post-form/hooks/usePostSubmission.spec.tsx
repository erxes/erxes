import { useApolloClient } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { usePostMutations } from '../../../../hooks/usePostMutations';
import { usePostSubmission } from './usePostSubmission';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: jest.fn(),
}));
jest.mock('erxes-ui', () => ({ toast: jest.fn() }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams()],
}));
jest.mock('../../../../hooks/usePostMutations', () => ({
  usePostMutations: jest.fn(),
}));
jest.mock('../../../postiz/PostizPublishSheet', () => ({
  PostizPublishSheet: () => null,
}));

const post = {
  title: 'CMS article',
  slug: 'cms-article',
  content: '<p>Article body</p>',
  type: 'post',
  status: 'published' as const,
};

const createPost = jest.fn();
const editPost = jest.fn();
const query = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  createPost.mockResolvedValue({ data: { cmsPostsAdd: { _id: 'post-1' } } });
  editPost.mockResolvedValue({ data: { cmsPostsEdit: { _id: 'post-1' } } });
  jest.mocked(usePostMutations).mockReturnValue({
    createPost,
    editPost,
    creating: false,
    saving: false,
  } as ReturnType<typeof usePostMutations>);
  jest
    .mocked(useApolloClient)
    .mockReturnValue({ query } as ReturnType<typeof useApolloClient>);
});

test.each([
  ['disabled', false],
  ['enabled', true],
] as const)(
  'published post with Postiz %s uses the correct flow',
  async (_, enabled) => {
    query.mockResolvedValue({ data: { agentPostizTenantEnabled: enabled } });
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      usePostSubmission({ websiteId: 'cms-1', onClose }),
    );

    await act(async () => {
      await result.current.onSubmit(post);
    });

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({ fetchPolicy: 'no-cache' }),
    );
    if (enabled) {
      expect(createPost).not.toHaveBeenCalled();
      expect(result.current.postizSheet).not.toBeNull();
    } else {
      expect(createPost).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(result.current.postizSheet).toBeNull();
    }
  },
);

test('CMS publishing remains available when the optional Postiz query fails', async () => {
  query.mockRejectedValue(new Error('Postiz query unavailable'));
  const onClose = jest.fn();
  const { result } = renderHook(() =>
    usePostSubmission({ websiteId: 'cms-1', onClose }),
  );

  await act(async () => {
    await result.current.onSubmit(post);
  });

  expect(createPost).toHaveBeenCalledTimes(1);
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(result.current.postizSheet).toBeNull();
});

test('publishing an existing post saves directly when Postiz is disabled', async () => {
  query.mockResolvedValue({ data: { agentPostizTenantEnabled: false } });
  const { result } = renderHook(() =>
    usePostSubmission({ websiteId: 'cms-1', editingPost: { _id: 'post-1' } }),
  );

  await act(async () => {
    await result.current.onSubmit(post);
  });

  expect(editPost).toHaveBeenCalledTimes(1);
  expect(createPost).not.toHaveBeenCalled();
  expect(result.current.postizSheet).toBeNull();
});
