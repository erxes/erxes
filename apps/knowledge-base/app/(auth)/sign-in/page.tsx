import Link from 'next/link';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';
import { SignInForm } from '@/modules/auth/components/SignInForm';
import { internalPath, withNext } from '@/modules/auth/utils/redirect';
import { getPortalIdentity } from '@/modules/layout/api';
import { site } from '@/modules/layout/constants/site';

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export const metadata = { title: 'Нэвтрэх' };

export default async function SignInPage({ searchParams }: Props) {
  const [{ headline }, params] = await Promise.all([
    getPortalIdentity(),
    searchParams,
  ]);

  /* Set by a guarded route, so the visitor lands back where they were headed. */
  const next = internalPath(params.next);

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
            href={withNext('/sign-up', next)}
            className="font-semibold text-brand transition-colors hover:text-brand-strong"
          >
            Бүртгүүлэх
          </Link>
        </>
      }
    >
      <SignInForm next={next} />
    </AuthLayout>
  );
}
