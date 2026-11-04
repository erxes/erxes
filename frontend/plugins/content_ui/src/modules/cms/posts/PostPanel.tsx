import { useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { CMS_POST } from '@/cms/graphql/queries';
import { ContentPanelRecordState } from '@/cms/shared/side-panel/ContentPanelLayout';
import {
  ContentPanelDate,
  ContentPanelOverview,
  ContentPanelStatusBadge,
} from '@/cms/shared/side-panel/ContentPanelOverview';
import { ContentPanelRemoveAction } from '@/cms/shared/side-panel/ContentPanelRemoveAction';
import {
  IContentPanelViewProps,
  IContentPanelViews,
} from '@/cms/shared/side-panel/contentPanelTypes';
import { useRemovePosts } from '@/cms/posts/hooks/useRemovePosts';
import { buildCurrentPostsReturnPath } from '@/cms/posts/utils/postsNavigation';

interface IPostPanelRecord {
  _id: string;
  clientPortalId: string;
  title?: string;
  slug?: string;
  status?: string;
  excerpt?: string;
  publishedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  thumbnail?: { url?: string };
  categories?: { _id: string; name: string }[];
  author?: { username?: string; details?: { fullName?: string } };
}

const PostPanelDetail = ({ contentId }: IContentPanelViewProps) => {
  const { t } = useTranslation('content');
  const navigate = useNavigate();
  const location = useLocation();
  const { data, loading } = useQuery(CMS_POST, {
    variables: { id: contentId },
    fetchPolicy: 'cache-and-network',
  });
  const post: IPostPanelRecord | undefined = data?.cmsPost;

  if (!post) {
    return <ContentPanelRecordState loading={loading} hasRecord={false} />;
  }

  const openEditor = () =>
    navigate(`/content/cms/${post.clientPortalId}/posts/detail/${post._id}`, {
      state: {
        returnTo: buildCurrentPostsReturnPath(
          location.pathname,
          location.search,
          post._id,
        ),
      },
    });

  return (
    <ContentPanelOverview
      title={post.title || t('untitled-post')}
      thumbnailUrl={post.thumbnail?.url}
      editLabel={t('edit')}
      onEdit={openEditor}
      fields={[
        {
          label: t('status'),
          value: <ContentPanelStatusBadge status={post.status} />,
        },
        { label: t('slug'), value: post.slug },
        {
          label: t('categories'),
          value: post.categories?.map((category) => category.name).join(', '),
        },
        {
          label: t('author'),
          value: post.author?.details?.fullName || post.author?.username,
        },
        {
          label: t('publish-date'),
          value: <ContentPanelDate value={post.publishedDate} />,
        },
        {
          label: t('created-at'),
          value: <ContentPanelDate value={post.createdAt} />,
        },
        {
          label: t('updated-at'),
          value: <ContentPanelDate value={post.updatedAt} />,
        },
      ]}
    >
      {post.excerpt && (
        <p className="whitespace-pre-wrap px-2 text-sm text-muted-foreground">
          {post.excerpt}
        </p>
      )}
    </ContentPanelOverview>
  );
};

const PostPanelActions = ({ contentId }: IContentPanelViewProps) => {
  const { t } = useTranslation('content');
  const { removePosts, loading } = useRemovePosts();

  return (
    <ContentPanelRemoveAction
      message={t('confirm-delete-this-post')}
      loading={loading}
      onRemove={(onCompleted) =>
        removePosts(contentId, { refetchQueries: ['CmsPostList'] })
          .then(() => {
            toast({
              title: t('success'),
              variant: 'success',
              description: t('post-deleted-successfully'),
            });
            onCompleted();
          })
          .catch((error: Error) =>
            toast({
              title: t('error'),
              description: error.message,
              variant: 'destructive',
            }),
          )
      }
    />
  );
};

export const POST_PANEL: IContentPanelViews = {
  addLabel: 'new-post',
  editLabel: 'edit-post',
  Detail: PostPanelDetail,
  Actions: PostPanelActions,
};
