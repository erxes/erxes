import { PageContainer, ScrollArea } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentUserState } from 'ui-modules';
import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { SupportAccessApproveDialog } from '@/settings/support-access/components/SupportAccessApproveDialog';
import { SupportAccessGrants } from '@/settings/support-access/components/SupportAccessGrants';
import { SupportAccessPolicyForm } from '@/settings/support-access/components/SupportAccessPolicyForm';

export function SupportAccessSettingsPage() {
  const { t } = useTranslation('settings', { keyPrefix: 'support-access' });
  const currentUser = useAtomValue(currentUserState);

  return (
    <PageContainer>
      <SettingsBreadcrumbs />
      <ScrollArea className="h-full">
        <section className="mx-auto max-w-2xl w-full relative">
          <h2 className="font-semibold text-lg mt-4 mb-2 px-4">{t('title')}</h2>
          <p className="text-sm text-muted-foreground mb-8 px-4">
            {t('description')}
          </p>
          <div className="px-4 w-full flex flex-col gap-10 pb-10">
            {currentUser?.isOwner ? (
              <>
                <SupportAccessGrants />
                <SupportAccessPolicyForm />
                <SupportAccessApproveDialog />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t('owner-only')}</p>
            )}
          </div>
        </section>
        <ScrollArea.Bar />
      </ScrollArea>
    </PageContainer>
  );
}
