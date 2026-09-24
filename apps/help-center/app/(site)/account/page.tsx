import { ProfileForm } from '@/modules/auth/components/ProfileForm';
import { RequireSession } from '@/modules/auth/components/RequireSession';
import { PortalShell } from '@/modules/layout/components/PortalShell';

export const metadata = { title: 'My account' };

const REASON = 'Sign in to see and edit your account details.';

export default function AccountPage() {
  return (
    <PortalShell
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'My account' }]}
      title="My account"
      description="Your account details and the tickets you have raised."
    >
      <div className="mx-auto w-full max-w-5xl">
        <RequireSession reason={REASON}>
          <ProfileForm />
        </RequireSession>
      </div>
    </PortalShell>
  );
}
