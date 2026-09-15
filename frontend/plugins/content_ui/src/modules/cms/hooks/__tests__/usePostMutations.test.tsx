import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  gql,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { CMS_POST, CMS_TRANSLATIONS } from '../../graphql/queries';
import { POSTS_LIST } from '../../posts/graphql/queries/postsListQueries';
import { usePostMutations } from '../usePostMutations';

jest.mock('../../graphql/queries', () => {
  const { gql } = jest.requireActual('@apollo/client');
  return {
    POSTS_ADD: gql`
      mutation PostsAdd($input: PostInput!) {
        cmsPostsAdd(input: $input) {
          _id
        }
      }
    `,
    CMS_POSTS_EDIT: gql`
      mutation CmsPostsEdit($id: String!, $input: PostInput!) {
        cmsPostsEdit(_id: $id, input: $input) {
          _id
        }
      }
    `,
    CMS_POSTS_REMOVE: gql`
      mutation CmsPostsRemove($id: String!) {
        cmsPostsRemove(_id: $id)
      }
    `,
    CMS_POST: gql`
      query Post($id: String) {
        cmsPost(_id: $id) {
          _id
          title
        }
      }
    `,
    CMS_TRANSLATIONS: gql`
      query cmsTranslations($objectId: String, $type: String) {
        cmsTranslations(objectId: $objectId, type: $type) {
          title
        }
      }
    `,
  };
});

jest.mock('../../posts/graphql/queries/postsListQueries', () => {
  const { gql } = jest.requireActual('@apollo/client');
  return {
    POSTS_LIST: gql`
      query CmsPostList($clientPortalId: String) {
        cmsPostList(clientPortalId: $clientPortalId) {
          posts {
            _id
            title
          }
        }
      }
    `,
  };
});

const threadQuery = gql`
  query AgentsThreadDetail($threadId: String!) {
    agentsThreadDetail(threadId: $threadId) {
      id
    }
  }
`;

function setup(
  failure?: 'save',
  threadPolicy: 'standby' | 'cache-only' = 'standby',
) {
  const requests: string[] = [];
  let saved = false;
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          const name = operation.operationName;
          requests.push(name);
          if (name === 'AgentsThreadDetail') {
            observer.error(new Error('invalid type for variable: threadId'));
            return;
          }
          if (name === 'CmsPostsEdit' || name === 'PostsAdd') {
            if (failure === 'save') {
              observer.error(new Error('CMS save failed'));
              return;
            }
            saved = true;
            observer.next({
              data: {
                [name === 'CmsPostsEdit' ? 'cmsPostsEdit' : 'cmsPostsAdd']: {
                  __typename: 'Post',
                  _id: 'post-1',
                },
              },
            });
          } else {
            const post = {
              __typename: 'Post',
              _id: 'post-1',
              title: saved ? 'Saved' : 'Old',
            };
            const data =
              name === 'Post'
                ? { cmsPost: post }
                : name === 'CmsPostList'
                  ? { cmsPostList: { posts: [post] } }
                  : { cmsTranslations: [{ title: post.title }] };
            observer.next({ data });
          }
          observer.complete();
        }),
    ),
  });
  const thread = client.watchQuery({
    query: threadQuery,
    variables: {},
    fetchPolicy: threadPolicy,
  });
  const threadSubscription = thread.subscribe({ error: () => undefined });
  const { result, unmount } = renderHook(() => usePostMutations(), {
    wrapper: ({ children }: PropsWithChildren) => (
      <ApolloProvider client={client}>{children}</ApolloProvider>
    ),
  });
  return {
    client,
    requests,
    result,
    cleanup: () => {
      unmount();
      threadSubscription.unsubscribe();
      client.stop();
    },
  };
}

describe('CMS post mutation isolation', () => {
  it.each(['standby', 'cache-only'] as const)(
    'refreshes CMS data without executing a %s assistant query',
    async (policy) => {
      const test = setup(undefined, policy);
      const queries = [
        test.client.watchQuery({
          query: CMS_POST,
          variables: { id: 'post-1' },
        }),
        test.client.watchQuery({
          query: POSTS_LIST,
          variables: { clientPortalId: 'cms-1' },
        }),
        test.client.watchQuery({
          query: CMS_TRANSLATIONS,
          variables: { objectId: 'post-1', type: 'post' },
        }),
      ];
      const subscriptions = queries.map((query) =>
        query.subscribe({ error: () => undefined }),
      );
      try {
        await Promise.all(queries.map((query) => query.result()));
        test.requests.length = 0;
        await act(async () => {
          const response = await test.result.current.editPost('post-1', {
            title: 'Saved',
          });
          expect(response.data?.cmsPostsEdit._id).toBe('post-1');
        });
        expect(test.requests.sort()).toEqual(
          ['CmsPostList', 'CmsPostsEdit', 'Post', 'cmsTranslations'].sort(),
        );
        expect(queries[0].getCurrentResult().data.cmsPost.title).toBe('Saved');
        expect(
          queries[1].getCurrentResult().data.cmsPostList.posts[0].title,
        ).toBe('Saved');
        expect(
          queries[2].getCurrentResult().data.cmsTranslations[0].title,
        ).toBe('Saved');
      } finally {
        subscriptions.forEach((subscription) => subscription.unsubscribe());
        test.cleanup();
      }
    },
  );

  it('preserves actual CMS save failures', async () => {
    const test = setup('save');
    try {
      await act(async () => {
        await expect(
          test.result.current.editPost('post-1', {}),
        ).rejects.toThrow('CMS save failed');
      });
      expect(test.requests).toEqual(['CmsPostsEdit']);
    } finally {
      test.cleanup();
    }
  });

  it('creates a CMS post without waking an assistant query', async () => {
    const test = setup();
    try {
      await act(async () => {
        const response = await test.result.current.createPost({
          title: 'Saved',
        });
        expect(response.data?.cmsPostsAdd._id).toBe('post-1');
      });
      expect(test.requests).toEqual(['PostsAdd']);
    } finally {
      test.cleanup();
    }
  });
});
