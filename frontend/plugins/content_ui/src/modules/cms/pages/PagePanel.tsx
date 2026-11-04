import { useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import { PAGE_DETAIL } from '@/cms/pages/graphql/queries/pageDetailQuery';
import { useRemovePage } from '@/cms/pages/hooks/useRemovePage';

interface IPagePanelRecord {
  _id: string;
  clientPortalId: string;
  name?: string;
  slug?: string;
  status?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  thumbnail?: { url?: string };
  createdUser?: { email?: string; details?: { fullName?: string } };
}

const PagePanelDetail = ({ contentId }: IContentPanelViewProps) => {
  const { t } = useTranslation('content');
  const navigate = useNavigate();
  const { data, loading } = useQuery(PAGE_DETAIL, {
    variables: { id: contentId },
    fetchPolicy: 'cache-and-network',
  });
  const page: IPagePanelRecord | undefined = data?.cmsPage;

  if (!page) {
    return <ContentPanelRecordState loading={loading} hasRecord={false} />;
  }

  return (
    <ContentPanelOverview
      title={page.name || t('untitled-page')}
      thumbnailUrl={page.thumbnail?.url}
      editLabel={t('edit')}
      onEdit={() =>
        navigate(`/content/cms/${page.clientPortalId}/pages/detail/${page._id}`)
      }
      fields={[
        {
          label: t('status'),
          value: <ContentPanelStatusBadge status={page.status} />,
        },
        { label: t('slug'), value: page.slug },
        {
          label: t('author'),
          value: page.createdUser?.details?.fullName || page.createdUser?.email,
        },
        {
          label: t('created-at'),
          value: <ContentPanelDate value={page.createdAt} />,
        },
        {
          label: t('updated-at'),
          value: <ContentPanelDate value={page.updatedAt} />,
        },
      ]}
    >
      {page.description && (
        <p className="whitespace-pre-wrap px-2 text-sm text-muted-foreground">
          {page.description}
        </p>
      )}
    </ContentPanelOverview>
  );
};

const PagePanelActions = ({ contentId }: IContentPanelViewProps) => {
  const { t } = useTranslation('content');
  const { removePage, loading } = useRemovePage();

  return (
    <ContentPanelRemoveAction
      message={t('confirm-delete-page')}
      loading={loading}
      onRemove={(onCompleted) =>
        removePage(contentId, { refetchQueries: ['PageList'] })
          .then(() => {
            toast({
              title: t('success'),
              variant: 'success',
              description: t('page-deleted-successfully'),
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

export const PAGE_PANEL: IContentPanelViews = {
  addLabel: 'add-page',
  editLabel: 'page',
  Detail: PagePanelDetail,
  Actions: PagePanelActions,
};
