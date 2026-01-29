import { IconAlertCircle, IconCloudExclamation } from '@tabler/icons-react';
import {
  Empty,
  FocusSheet,
  ScrollArea,
  Separator,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CPUserDetailGeneral } from '@/contacts/client-portal-users/cp-user-detail/components/CPUserDetailGeneral';
import { CPUserDetailFields } from '@/contacts/client-portal-users/cp-user-detail/components/CPUserDetailFields';
import { useClientPortalUser } from '@/contacts/client-portal-users/hooks/useClientPortalUser';

export function CPUserDetail() {
  const { t } = useTranslation('contact', {
    keyPrefix: 'clientPortalUser.detail',
  });
  const [open, setOpen] = useQueryState<string>('cpUserId');
  const { cpUser, loading, error } = useClientPortalUser();

  return (
    <FocusSheet open={!!open} onOpenChange={() => setOpen(null)}>
      <FocusSheet.View
        loading={loading}
        error={!!error}
        notFound={!cpUser && !loading}
        notFoundState={<CPUserDetailEmptyState />}
        errorState={<CPUserDetailErrorState />}
      >
        <FocusSheet.Header
          title={t('title', { defaultValue: 'Client Portal User' })}
        />
        <FocusSheet.Content>
          <div className="flex-1 flex flex-col overflow-hidden">
            <CPUserDetailGeneral />
            <Separator />
            <ScrollArea className="h-full">
              <CPUserDetailFields />
            </ScrollArea>
          </div>
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
}

function CPUserDetailEmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconCloudExclamation />
          </Empty.Media>
          <Empty.Title>Client Portal User not found</Empty.Title>
          <Empty.Description>
            There seems to be no client portal user with this ID.
          </Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
}

function CPUserDetailErrorState() {
  const { error } = useClientPortalUser();
  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>Error</Empty.Title>
          <Empty.Description>{error?.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
}
