import { IconBell, IconHistory, IconId } from '@tabler/icons-react';
import { Button, Empty, ScrollArea, Spinner } from 'erxes-ui';
import { useContext, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityLogs,
  type IRecordViewProps,
  NEW_RECORD_ID,
  RecordSidePanel,
  usePanelExpanded,
  usePermissionCheck,
  useSidePanel,
} from 'ui-modules';
import { PanelRecordContext } from '@/side-panel/contexts/PanelRecordContext';
import { ContactPanelBreadcrumb } from '@/side-panel/components/details/ContactPanelBreadcrumb';
import { AddCPUserForm } from '@/contacts/client-portal-users/components/AddCPUserForm';
import { CPUserPanelIdContext } from '@/contacts/client-portal-users/contexts/CPUserPanelIdContext';
import { useClientPortalUser } from '@/contacts/client-portal-users/hooks/useClientPortalUser';
import { CPUserDetailFields } from './CPUserDetailFields';
import { CPUserDetailNotifications } from './CPUserDetailNotifications';
import { CPUserPanelProfile } from './CPUserPanelProfile';
import { CPUserPanelActions } from './CPUserPanelActions';

export const CPUserRecordPanel = (props: IRecordViewProps) => (
  <CPUserPanelIdContext.Provider value={props.record.contentId}>
    <CPUserPanelBody {...props} />
  </CPUserPanelIdContext.Provider>
);

const CPUserPanelBody = ({ record, onBack, onClose }: IRecordViewProps) => {
  const { t } = useTranslation('contact', { keyPrefix: 'clientPortalUser' });
  const isNew = record.contentId === NEW_RECORD_ID;
  const { cpUser, loading, error, refetch } = useClientPortalUser({
    skip: isNew,
  });
  const { hasActionPermission } = usePermissionCheck();
  const parentView = useContext(PanelRecordContext);
  const { tab: selectedTab, setTab } = useSidePanel();
  const expanded = usePanelExpanded();
  const tab = ['overview', 'activity', 'notifications'].includes(selectedTab)
    ? selectedTab
    : 'overview';
  const panelView = useMemo(
    () => ({ ...parentView, ...record, tab }),
    [parentView, record, tab],
  );
  const title = isNew
    ? t('add._', 'Add client portal user')
    : [cpUser?.firstName, cpUser?.lastName].filter(Boolean).join(' ') ||
      cpUser?.email ||
      cpUser?.username ||
      t('detail.title', 'Client portal user');
  const header = (
    <RecordSidePanel.Header
      className={expanded ? 'h-10 bg-background px-3' : undefined}
      title={
        !isNew && expanded ? (
          <ContactPanelBreadcrumb contentType="core:cpUser" title={title} />
        ) : (
          title
        )
      }
      actions={!isNew && cpUser && <CPUserPanelActions user={cpUser} />}
      onBack={onBack}
      onClose={onClose}
    />
  );
  const scroll = (content: ReactNode) => (
    <ScrollArea className="min-h-0 flex-1" viewportClassName="[&>div]:block!">
      {content}
    </ScrollArea>
  );
  if (isNew)
    return (
      <>
        {header}
        {hasActionPermission('clientPortalManage') ? (
          <AddCPUserForm
            onOpenChange={(open) => !open && (onBack || onClose)()}
          />
        ) : (
          <div className="p-4">Access denied</div>
        )}
      </>
    );
  if (loading && !cpUser)
    return (
      <>
        {header}
        <Spinner containerClassName="py-12" />
      </>
    );
  if (error || !cpUser)
    return (
      <>
        {header}
        <Empty>
          <Empty.Header>
            <Empty.Title>
              {t('detail.not-found', 'User unavailable')}
            </Empty.Title>
            <Empty.Description>{error?.message}</Empty.Description>
          </Empty.Header>
          <Empty.Content>
            <Button onClick={() => refetch()}>{t('retry', 'Retry')}</Button>
          </Empty.Content>
        </Empty>
      </>
    );
  return (
    <PanelRecordContext.Provider value={panelView}>
      <RecordSidePanel.Layout
        header={header}
        profile={<CPUserPanelProfile />}
        value={tab}
        onValueChange={setTab}
        tabs={[
          {
            value: 'overview',
            label: t('detail.overview', 'Details'),
            icon: IconId,
            content: scroll(<CPUserDetailFields />),
          },
          {
            value: 'activity',
            label: t('detail.activity', 'Activity'),
            icon: IconHistory,
            content: scroll(<ActivityLogs targetId={cpUser._id} />),
          },
          {
            value: 'notifications',
            label: t('detail.notifications', 'Notifications'),
            icon: IconBell,
            content: <CPUserDetailNotifications />,
          },
        ]}
      />
    </PanelRecordContext.Provider>
  );
};
