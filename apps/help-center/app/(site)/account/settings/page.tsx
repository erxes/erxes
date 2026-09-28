import { RequireSession } from '@/modules/auth/components/RequireSession';
import { SettingsPanel } from '@/modules/auth/components/SettingsPanel';
import { getT } from '@/modules/i18n/server';
import { PortalShell } from '@/modules/layout/components/PortalShell';

export const generateMetadata = async () => ({
  title: (await getT())('account.settings'),
});

export default async function AccountSettingsPage() {
  const t = await getT();

  return (
    <PortalShell
      breadcrumbs={[
        { label: t('nav.home'), href: '/' },
        { label: t('account.mine'), href: '/account' },
        { label: t('account.settings') },
      ]}
      title={t('account.settings')}
      description={t('account.settingsDescription')}
    >
      <div className="w-full max-w-5xl">
        <RequireSession reason={t('account.reasonSettings')}>
          <SettingsPanel />
        </RequireSession>
      </div>
    </PortalShell>
  );
}
