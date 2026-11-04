import {
  IntegrationChannelContext,
  INTEGRATION_CONTENT_TYPE,
} from '@/integrations/components/IntegrationPanelForm';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { IntegrationActionsMenu } from '@/integrations/components/IntegrationMoreColumn';
import { IconDotsVertical } from '@tabler/icons-react';
import { Button, Empty, ScrollArea, Skeleton, Spinner } from 'erxes-ui';
import { lazy, Suspense, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { IntegrationDraftContext } from '@/integrations/hooks/useIntegrationDraft';
import { matchPath, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ActivityLogs,
  type IRecordPanelProps,
  useSidePanelDraft,
  useSidePanel,
} from 'ui-modules';
import { removedIntegrationIdsAtom } from '@/integrations/states/integrationRemoveStates';

const IntegrationRecordForm = lazy(() =>
  import('./IntegrationRecordForm').then((module) => ({
    default: module.IntegrationRecordForm,
  })),
);

/** Shows the integration name or the loading title placeholder. */
const IntegrationPanelTitle = ({
  loading,
  integration,
  fallback,
}: {
  loading: boolean;
  integration?: { name?: string | null } | null;
  fallback: string;
}) =>
  loading && !integration ? (
    <Skeleton className="h-4 w-32" />
  ) : (
    integration?.name || fallback
  );

/** Renders integration title, actions, activity, or the provider form by view. */
export const IntegrationRecordPanel = ({
  contentId,
  view,
}: IRecordPanelProps) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { pathname } = useLocation();
  const user = useAtomValue(currentUserState);
  const removedIds = useAtomValue(removedIntegrationIdsAtom);
  const { record, canGoBack, back, close } = useSidePanel();
  useEffect(() => {
    if (
      view !== 'title' ||
      record?.contentType !== INTEGRATION_CONTENT_TYPE ||
      record.contentId !== contentId ||
      !removedIds.has(contentId)
    )
      return;
    if (canGoBack) back();
    else close();
  }, [view, record, contentId, removedIds, canGoBack, back, close]);
  const draft = useSidePanelDraft<{ kind: string; channelId: string }>(
    INTEGRATION_CONTENT_TYPE,
  );
  const route = matchPath(
    '/frontline/settings/channels/details/:id/:integrationType',
    pathname,
  );
  const isNew = contentId === 'new';
  const { integrationDetail, loading, error } = useIntegrationDetail({
    integrationId: isNew ? null : contentId,
  });

  if (view === 'title')
    return (
      <IntegrationPanelTitle
        loading={loading}
        integration={integrationDetail}
        fallback={t('integration', 'Integration')}
      />
    );
  if (view === 'actions')
    return integrationDetail ? (
      <IntegrationActionsMenu
        integration={integrationDetail}
        showEdit={false}
        trigger={
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            aria-label={t('actions', 'Actions')}
          >
            <IconDotsVertical />
          </Button>
        }
      />
    ) : null;
  if (!isNew && loading && !integrationDetail)
    return <Spinner containerClassName="py-12" />;
  if (!isNew && !integrationDetail)
    return (
      <Empty>
        <Empty.Header>
          <Empty.Title>
            {t('integration-not-found', 'Integration unavailable')}
          </Empty.Title>
          <Empty.Description>{error?.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    );
  if (view === 'activity')
    return (
      <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
        <ActivityLogs targetId={contentId} showInternalNotes={false} />
      </ScrollArea>
    );

  const kind =
    (!isNew && integrationDetail?.kind) ||
    draft.kind ||
    route?.params.integrationType ||
    '';
  const channelId =
    (!isNew && integrationDetail?.channelId) ||
    draft.channelId ||
    route?.params.id;
  return (
    <IntegrationDraftContext.Provider
      value={JSON.stringify([user?._id, contentId, kind, channelId])}
    >
      <IntegrationChannelContext.Provider value={channelId}>
        <Suspense fallback={<Spinner containerClassName="py-12" />}>
          <IntegrationRecordForm
            key={`${contentId}:${kind}`}
            kind={kind}
            id={isNew ? undefined : contentId}
          />
        </Suspense>
      </IntegrationChannelContext.Provider>
    </IntegrationDraftContext.Provider>
  );
};
