import Link from 'next/link';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';
import { SignUpForm } from '@/modules/auth/components/SignUpForm';
import { getPortalIdentity } from '@/modules/layout/api';
import { site } from '@/modules/layout/constants/site';

export const metadata = { title: 'Бүртгүүлэх' };

export default async function SignUpPage() {
  const { headline } = await getPortalIdentity();

  return (
    <AuthLayout
      title="Бүртгэл үүсгэх"
      subtitle="Мэдлэгийн сан, дэмжлэгийн порталыг бүрэн ашиглахын тулд бүртгүүлнэ үү."
      headline={headline}
      blurb={site.authBlurb}
      footer={
        <>
          Бүртгэлтэй юу?{' '}
          <Link
            href="/sign-in"
            className="font-semibold text-brand transition-colors hover:text-brand-strong"
          >
            Нэвтрэх
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthLayout>
  );
}
