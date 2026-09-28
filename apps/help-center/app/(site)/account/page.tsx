import { AccountPanel } from '@/modules/auth/components/AccountPanel';
import { PortalShell } from '@/modules/layout/components/PortalShell';

export const metadata = { title: 'My account' };

export default function AccountPage() {
  return (
    <PortalShell
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'My account' }]}
      title="My account"
      description="Your account details and the tickets you have raised."
    >
      <div className="mx-auto w-full max-w-3xl">
        <AccountPanel />
      </div>
    </PortalShell>
  );
}
