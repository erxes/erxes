import Link from 'next/link';
import { getPortalIdentity } from '@/modules/layout/api';
import { AuthCard } from '@/modules/auth/components/AuthCard';
import { SignInForm } from '@/modules/auth/components/SignInForm';

export const metadata = { title: 'Нэвтрэх' };

export default async function SignInPage() {
  const { title } = await getPortalIdentity();

  return (
    <div className="flex flex-1 flex-col justify-center bg-subtle">
      <AuthCard
        title="Нэвтрэх"
        subtitleBrand={title}
        subtitle="Хүсэлтийн түүх болон дотоод нийтлэлүүдээ үзэхийн тулд нэвтэрнэ үү."
        footer={
          <>
            Бүртгэлгүй юу?{' '}
            <Link
              href="/sign-up"
              className="font-semibold text-brand transition-colors hover:text-brand-strong"
            >
              Бүртгүүлэх
            </Link>
          </>
        }
      >
        <SignInForm />
      </AuthCard>
    </div>
  );
}
