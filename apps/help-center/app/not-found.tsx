import { knowledgeBaseName } from '@/modules/knowledge-base/utils/label';
import { getT } from '@/modules/i18n/server';
import { getPortalSettings } from '@/modules/layout/api';
import { SiteShell } from '@/modules/layout/components/SiteShell';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Container } from '@/modules/ui/components/Container';
import { Icon } from '@/modules/ui/components/Icon';

export default async function NotFound() {
  const [settings, t] = await Promise.all([getPortalSettings(), getT()]);
  const knowledgeBase = knowledgeBaseName(settings.knowledgeBaseLabel, t);

  return (
    <SiteShell>
      <Container
        width="text"
        className="flex flex-col items-center py-24 text-center"
      >
        <span className="mb-6 flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Icon name="alert" size={26} />
        </span>
        <h1 className="text-2xl font-semibold text-ink">
          {t('notFound.title')}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t('notFound.text', { kb: knowledgeBase.inline })}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">{t('common.homePage')}</ButtonLink>
          <ButtonLink href="/tickets/new" variant="secondary">
            {t('tickets.submit')}
          </ButtonLink>
        </div>
      </Container>
    </SiteShell>
  );
}
