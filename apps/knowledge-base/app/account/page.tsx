import { AccountPanel } from '@/modules/auth/components/AccountPanel';
import { Breadcrumbs } from '@/modules/ui/Breadcrumbs';

export const metadata = { title: 'Миний хуудас' };

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[{ label: 'Мэдлэгийн сан', href: '/' }, { label: 'Миний хуудас' }]}
      />

      <h1 className="mt-6 text-[28px] font-semibold text-ink">Миний хуудас</h1>
      <p className="mt-2 text-sm text-muted">
        Бүртгэлийн мэдээлэл болон хүсэлтийн түүх рүү хурдан хандах цэс.
      </p>

      <div className="mt-7">
        <AccountPanel />
      </div>
    </div>
  );
}
