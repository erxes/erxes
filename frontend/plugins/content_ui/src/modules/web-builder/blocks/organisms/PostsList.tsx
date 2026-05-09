import { useQuery } from '@apollo/client';
import { Spinner } from 'erxes-ui';
import { IconArticle } from '@tabler/icons-react';
import { POST_LIST } from '~/modules/cms/graphql/queries';
import { BlockDefinition, BlockRenderProps } from '../types';

interface PostsListProps {
  title: string;
  limit: number;
  layout: 'grid' | 'list';
  // Optional category filter is selected in the inspector and persisted in
  // BlockInstance.contentTypeId; passed in via props.categoryId for render.
  categoryId?: string;
}

interface PostThumbnail {
  url?: string;
}
interface PostNode {
  _id: string;
  title?: string;
  excerpt?: string;
  thumbnail?: PostThumbnail;
  createdAt?: string;
}

const PostsListRender = ({
  props,
  clientPortalId,
}: BlockRenderProps<PostsListProps>) => {
  const { data, loading, error } = useQuery(POST_LIST, {
    variables: {
      clientPortalId,
      limit: props.limit || 6,
      sortField: 'createdAt',
      sortDirection: 'desc',
    },
    skip: !clientPortalId,
    fetchPolicy: 'cache-and-network',
  });

  const posts: PostNode[] = data?.cmsPostList?.posts || [];

  if (!clientPortalId) {
    return (
      <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
        PostsList requires a client portal.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-dashed p-6 text-sm text-destructive">
        Could not load posts: {error.message}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground flex items-center gap-2">
        <IconArticle size={16} />
        No posts yet.
      </div>
    );
  }

  const isGrid = (props.layout || 'grid') === 'grid';

  return (
    <section className="space-y-5">
      {props.title && (
        <h2 className="text-2xl font-semibold tracking-tight">{props.title}</h2>
      )}
      <div
        className={
          isGrid
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
            : 'flex flex-col gap-4'
        }
      >
        {posts.map((post) => (
          <article
            key={post._id}
            className={
              isGrid
                ? 'rounded-md border overflow-hidden bg-card'
                : 'rounded-md border bg-card p-4 flex gap-4'
            }
          >
            {post.thumbnail?.url && (
              <div
                className={
                  isGrid
                    ? 'aspect-video bg-muted'
                    : 'w-32 h-24 shrink-0 rounded-md overflow-hidden bg-muted'
                }
              >
                <img
                  src={post.thumbnail.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className={isGrid ? 'p-4 space-y-1' : 'space-y-1 min-w-0'}>
              <h3 className="font-semibold leading-snug line-clamp-2">
                {post.title || 'Untitled'}
              </h3>
              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export const postsListBlock: BlockDefinition<PostsListProps> = {
  key: 'organism.postsList',
  level: 'organism',
  category: 'CMS',
  label: 'Posts list',
  description: 'Renders posts from the connected CMS.',
  icon: IconArticle,
  contentType: 'cmsCategory',
  defaultProps: {
    title: 'Latest posts',
    limit: 6,
    layout: 'grid',
  },
  propSchema: {
    title: { type: 'text', label: 'Section title' },
    limit: { type: 'number', label: 'Number of posts', min: 1, max: 24 },
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { value: 'grid', label: 'Grid' },
        { value: 'list', label: 'List' },
      ],
    },
    categoryId: {
      type: 'cmsRef',
      label: 'Filter by category',
      kind: 'cmsCategory',
    },
  },
  Render: PostsListRender,
};
