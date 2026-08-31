import Link from 'next/link';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';
import { SignUpForm } from '@/modules/auth/components/SignUpForm';
import { internalPath, withNext } from '@/modules/auth/utils/redirect';
import { getPortalIdentity } from '@/modules/layout/api';
import { site } from '@/modules/layout/constants/site';

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export const metadata = { title: 'Бүртгүүлэх' };

export default async function SignUpPage({ searchParams }: Props) {
  const [{ headline }, params] = await Promise.all([
    getPortalIdentity(),
    searchParams,
  ]);

  /* Carried over from the guarded route the visitor was sent away from. */
  const next = internalPath(params.next);

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
            href={withNext('/sign-in', next)}
            className="font-semibold text-brand transition-colors hover:text-brand-strong"
          >
            Нэвтрэх
          </Link>
        </>
      }
    >
      <SignUpForm next={next} />
    </AuthLayout>
  );
}
