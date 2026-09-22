import Link from 'next/link';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';
import { SignUpForm } from '@/modules/auth/components/SignUpForm';
import { internalPath, withNext } from '@/modules/auth/utils/redirect';
import { getPortalIdentity } from '@/modules/layout/api';
import { site } from '@/modules/layout/constants/site';

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export const metadata = { title: 'Sign up' };

export default async function SignUpPage({ searchParams }: Props) {
  const [{ headline }, params] = await Promise.all([
    getPortalIdentity(),
    searchParams,
  ]);

  const next = internalPath(params.next);

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Sign up to get the most out of the knowledge base and support portal."
      headline={headline}
      blurb={site.authBlurb}
      footer={
        <>
          Already have an account?{' '}
          <Link
            href={withNext('/sign-in', next)}
            className="font-semibold text-brand transition-colors hover:text-brand-strong"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm next={next} />
    </AuthLayout>
  );
}
