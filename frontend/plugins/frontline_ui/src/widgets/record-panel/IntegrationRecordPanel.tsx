import {
  IntegrationChannelContext,
  INTEGRATION_CONTENT_TYPE,
} from '@/integrations/components/IntegrationPanelForm';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { IntegrationActionsMenu } from '@/integrations/components/IntegrationMoreColumn';
import { IconDotsVertical } from '@tabler/icons-react';
import { Button, Empty, ScrollArea, Skeleton, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ActivityLogs,
  type IRecordPanelProps,
  useSidePanelDraft,
} from 'ui-modules';

const IntegrationRecordForm = lazy(() =>
  import('./IntegrationRecordForm').then((module) => ({
    default: module.IntegrationRecordForm,
  })),
);

export const IntegrationRecordPanel = ({
  contentId,
  view,
}: IRecordPanelProps) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { pathname } = useLocation();
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
    return loading && !integrationDetail ? (
      <Skeleton className="h-4 w-32" />
    ) : (
      integrationDetail?.name || t('integration', 'Integration')
    );
  if (view === 'actions')
    return integrationDetail ? (
      <IntegrationActionsMenu
        integration={integrationDetail}
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
    integrationDetail?.kind ||
    draft.kind ||
    route?.params.integrationType ||
    '';
  const channelId =
    integrationDetail?.channelId || draft.channelId || route?.params.id;
  return (
    <IntegrationChannelContext.Provider value={channelId}>
      <Suspense fallback={<Spinner containerClassName="py-12" />}>
        <IntegrationRecordForm
          key={`${contentId}:${kind}`}
          kind={kind}
          id={isNew ? undefined : contentId}
        />
      </Suspense>
    </IntegrationChannelContext.Provider>
  );
};
