import Link from 'next/link';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';
import { SignUpForm } from '@/modules/auth/components/SignUpForm';
import { internalPath, withNext } from '@/modules/auth/utils/redirect';
import { knowledgeBaseName } from '@/modules/knowledge-base/utils/label';
import { getPortalIdentity, getPortalSettings } from '@/modules/layout/api';
import { getT } from '@/modules/i18n/server';

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export const generateMetadata = async () => ({
  title: (await getT())('auth.signUp'),
});

export default async function SignUpPage({ searchParams }: Props) {
  const [{ headline }, settings, params, t] = await Promise.all([
    getPortalIdentity(),
    getPortalSettings(),
    searchParams,
    getT(),
  ]);

  const knowledgeBase = knowledgeBaseName(settings.knowledgeBaseLabel, t);

  const next = internalPath(params.next);

  return (
    <AuthLayout
      title={t('auth.createAccount')}
      subtitle={t('auth.signUpSubtitle', { kb: knowledgeBase.inline })}
      headline={headline}
      blurb={t('site.authBlurb')}
      footer={
        <>
          {t('auth.haveAccount')}{' '}
          <Link
            href={withNext('/sign-in', next)}
            className="font-semibold text-brand transition-colors hover:text-brand-strong"
          >
            {t('auth.signIn')}
          </Link>
        </>
      }
    >
      <SignUpForm next={next} />
    </AuthLayout>
  );
}
