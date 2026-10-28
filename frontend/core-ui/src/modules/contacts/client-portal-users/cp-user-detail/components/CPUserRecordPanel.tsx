import { IconBell, IconHistory, IconId } from '@tabler/icons-react';
import { Button, Empty, ScrollArea, Spinner } from 'erxes-ui';
import { useContext, useState } from 'react';
import { PanelRecordContext } from '@/side-panel/contexts/PanelRecordContext';
import { useTranslation } from 'react-i18next';
import {
  ActivityLogs,
  IRecordViewProps,
  NEW_RECORD_ID,
  RecordSidePanel,
  usePermissionCheck,
} from 'ui-modules';
import { AddCPUserForm } from '@/contacts/client-portal-users/components/AddCPUserForm';
import { CPUserPanelIdContext } from '@/contacts/client-portal-users/contexts/CPUserPanelIdContext';
import { useClientPortalUser } from '@/contacts/client-portal-users/hooks/useClientPortalUser';
import { CPUserDetailFields } from '@/contacts/client-portal-users/cp-user-detail/components/CPUserDetailFields';
import { CPUserDetailGeneral } from '@/contacts/client-portal-users/cp-user-detail/components/CPUserDetailGeneral';
import { CPUserDetailNotifications } from '@/contacts/client-portal-users/cp-user-detail/components/CPUserDetailNotifications';

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
  const [tab, setTab] = useState(parentView?.tab || 'overview');
  const scroll = (content: React.ReactNode) => (
    <ScrollArea className="min-h-0 flex-1" viewportClassName="[&>div]:block!">
      {content}
    </ScrollArea>
  );

  return (
    <>
      <RecordSidePanel.Header
        title={
          isNew
            ? t('add._', { defaultValue: 'Add client portal user' })
            : [cpUser?.firstName, cpUser?.lastName].filter(Boolean).join(' ') ||
              cpUser?.email ||
              cpUser?.username ||
              t('detail.title', { defaultValue: 'Client portal user' })
        }
        onBack={onBack}
        onClose={onClose}
      />
      {isNew ? (
        hasActionPermission('clientPortalManage') ? (
          <AddCPUserForm
            onOpenChange={(open) => !open && (onBack || onClose)()}
          />
        ) : (
          <div className="p-4">Access denied</div>
        )
      ) : loading && !cpUser ? (
        <Spinner containerClassName="py-12" />
      ) : error || !cpUser ? (
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
      ) : (
        <PanelRecordContext.Provider value={{ ...parentView, ...record, tab }}>
          <RecordSidePanel.Tabs
            value={tab}
            onValueChange={setTab}
            tabs={[
              {
                value: 'overview',
                label: t('detail.overview', 'Details'),
                icon: IconId,
                content: scroll(
                  <>
                    <CPUserDetailGeneral />
                    <CPUserDetailFields />
                  </>,
                ),
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
      )}
    </>
  );
};
