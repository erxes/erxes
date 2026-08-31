import { AccountPanel } from '@/modules/auth/components/AccountPanel';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { Container } from '@/modules/ui/components/Container';

export const metadata = { title: 'Миний хуудас' };

export default function AccountPage() {
  return (
    <Container column="text" className="py-10 lg:py-14">
      <Breadcrumbs
        items={[
          { label: 'Мэдлэгийн сан', href: '/' },
          { label: 'Миний хуудас' },
        ]}
      />

      <h1 className="mt-6 text-[28px] font-semibold text-ink">Миний хуудас</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Бүртгэлийн мэдээлэл болон хүсэлтийн түүх рүү хурдан хандах цэс.
      </p>

      <div className="mt-7">
        <AccountPanel />
      </div>
    </Container>
  );
}
