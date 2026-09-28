import { RequireSession } from '@/modules/auth/components/RequireSession';
import { getT } from '@/modules/i18n/server';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { NotificationsPanel } from '@/modules/notifications/components/NotificationFeed';

export const generateMetadata = async () => ({
  title: (await getT())('account.notifications'),
});

export default async function NotificationsPage() {
  const t = await getT();

  return (
    <PortalShell
      breadcrumbs={[
        { label: t('nav.home'), href: '/' },
        { label: t('account.mine'), href: '/account' },
        { label: t('account.notifications') },
      ]}
      title={t('account.notifications')}
      description={t('account.notificationsDescription')}
    >
      <div className="w-full max-w-5xl">
        <RequireSession reason={t('account.reasonNotifications')}>
          <NotificationsPanel />
        </RequireSession>
      </div>
    </PortalShell>
  );
}
