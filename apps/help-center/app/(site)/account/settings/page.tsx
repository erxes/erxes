import { RequireSession } from '@/modules/auth/components/RequireSession';
import { SettingsPanel } from '@/modules/auth/components/SettingsPanel';
import { PortalShell } from '@/modules/layout/components/PortalShell';

export const metadata = { title: 'Settings' };

const REASON = 'Sign in to manage your account settings.';

export default function AccountSettingsPage() {
  return (
    <PortalShell
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'My account', href: '/account' },
        { label: 'Settings' },
      ]}
      title="Settings"
      description="Your password, sign-in details and account controls."
    >
      <div className="mx-auto w-full max-w-5xl">
        <RequireSession reason={REASON}>
          <SettingsPanel />
        </RequireSession>
      </div>
    </PortalShell>
  );
}
