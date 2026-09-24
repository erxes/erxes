import { RequireSession } from '@/modules/auth/components/RequireSession';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { NotificationsPanel } from '@/modules/notifications/components/NotificationFeed';

export const metadata = { title: 'Notifications' };

const REASON = 'Sign in to see your notifications.';

export default function NotificationsPage() {
  return (
    <PortalShell
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'My account', href: '/account' },
        { label: 'Notifications' },
      ]}
      title="Notifications"
      description="Everything the support team and the portal have sent you."
    >
      <div className="mx-auto w-full max-w-5xl">
        <RequireSession reason={REASON}>
          <NotificationsPanel />
        </RequireSession>
      </div>
    </PortalShell>
  );
}
