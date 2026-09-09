import { AccountPanel } from '@/modules/auth/components/AccountPanel';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { Container } from '@/modules/ui/components/Container';

export const metadata = { title: 'My account' };

export default function AccountPage() {
  return (
    <Container column="text" className="py-10 lg:py-14">
      <Breadcrumbs
        items={[
          { label: 'Knowledge base', href: '/' },
          { label: 'My account' },
        ]}
      />

      <h1 className="mt-6 text-[30px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">My account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Quick access to your account details and ticket history.
      </p>

      <div className="mt-7">
        <AccountPanel />
      </div>
    </Container>
  );
}
