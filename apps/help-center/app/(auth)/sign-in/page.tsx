import Link from 'next/link';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';
import { SignInForm } from '@/modules/auth/components/SignInForm';
import { internalPath, withNext } from '@/modules/auth/utils/redirect';
import { getPortalIdentity } from '@/modules/layout/api';
import { site } from '@/modules/layout/constants/site';

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export const metadata = { title: 'Sign in' };

export default async function SignInPage({ searchParams }: Props) {
  const [{ headline }, params] = await Promise.all([
    getPortalIdentity(),
    searchParams,
  ]);

  const next = internalPath(params.next);

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue."
      headline={headline}
      blurb={site.authBlurb}
      footer={
        <>
          No account yet?{' '}
          <Link
            href={withNext('/sign-up', next)}
            className="font-semibold text-brand transition-colors hover:text-brand-strong"
          >
            Sign up
          </Link>
        </>
      }
    >
      <SignInForm next={next} />
    </AuthLayout>
  );
}
