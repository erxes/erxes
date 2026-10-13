import { ProfileForm } from '@/modules/auth/components/ProfileForm';
import { RequireSession } from '@/modules/auth/components/RequireSession';
import { getT } from '@/modules/i18n/server';
import { PortalShell } from '@/modules/layout/components/PortalShell';

export const generateMetadata = async () => ({
  title: (await getT())('account.mine'),
});

export default async function AccountPage() {
  const t = await getT();

  return (
    <PortalShell
      breadcrumbs={[
        { label: t('nav.home'), href: '/' },
        { label: t('account.mine') },
      ]}
      title={t('account.mine')}
      description={t('account.description')}
    >
      <div className="w-full max-w-5xl">
        <RequireSession reason={t('account.reasonProfile')}>
          <ProfileForm />
        </RequireSession>
      </div>
    </PortalShell>
  );
}
