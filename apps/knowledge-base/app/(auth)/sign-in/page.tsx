import Link from 'next/link';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';
import { SignInForm } from '@/modules/auth/components/SignInForm';
import { getPortalIdentity } from '@/modules/layout/api';
import { site } from '@/modules/layout/constants/site';

export const metadata = { title: 'Нэвтрэх' };

export default async function SignInPage() {
  const { headline } = await getPortalIdentity();

  return (
    <AuthLayout
      title="Тавтай морил"
      subtitle="Үргэлжлүүлэхийн тулд бүртгэлдээ нэвтэрнэ үү."
      headline={headline}
      blurb={site.authBlurb}
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
    </AuthLayout>
  );
}
