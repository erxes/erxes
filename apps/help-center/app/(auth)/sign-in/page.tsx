import Link from 'next/link';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';
import { SignInForm } from '@/modules/auth/components/SignInForm';
import { internalPath, withNext } from '@/modules/auth/utils/redirect';
import { getPortalIdentity } from '@/modules/layout/api';
import { getT } from '@/modules/i18n/server';

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export const generateMetadata = async () => ({
  title: (await getT())('auth.signIn'),
});

export default async function SignInPage({ searchParams }: Props) {
  const [{ headline }, params, t] = await Promise.all([
    getPortalIdentity(),
    searchParams,
    getT(),
  ]);

  const next = internalPath(params.next);

  return (
    <AuthLayout
      title={t('auth.welcomeBack')}
      subtitle={t('auth.signInSubtitle')}
      headline={headline}
      blurb={t('site.authBlurb')}
      footer={
        <>
          {t('auth.noAccount')}{' '}
          <Link
            href={withNext('/sign-up', next)}
            className="font-semibold text-brand transition-colors hover:text-brand-strong"
          >
            {t('auth.signUp')}
          </Link>
        </>
      }
    >
      <SignInForm next={next} />
    </AuthLayout>
  );
}
