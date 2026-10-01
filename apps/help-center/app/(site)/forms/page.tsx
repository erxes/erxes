import { getPortalForms } from '@/modules/forms/api';
import { FormList } from '@/modules/forms/components/FormList';
import { getT } from '@/modules/i18n/server';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { CountBadge } from '@/modules/ui/components/PageHeader';
import { ButtonLink } from '@/modules/ui/components/Button';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

export const generateMetadata = async () => ({
  title: (await getT())('nav.forms'),
});

export default async function FormsPage() {
  const [forms, t] = await Promise.all([getPortalForms(), getT()]);

  return (
    <PortalShell
      breadcrumbs={[
        { label: t('nav.home'), href: '/' },
        { label: t('nav.forms') },
      ]}
      title={t('nav.forms')}
      description={t('forms.description')}
      meta={
        forms.state === 'ready' && forms.data.length ? (
          <CountBadge
            count={forms.data.length}
            label={t('forms.countLabel', { count: forms.data.length })}
          />
        ) : null
      }
    >
      {forms.state === 'unconfigured' ? (
        <SetupNotice missing={forms.missing} />
      ) : forms.state === 'unpublished' ? (
        <Unpublished domain={forms.domain} />
      ) : forms.state === 'error' ? (
        <LoadError title={t('forms.loadFailed')} message={forms.message} />
      ) : forms.data.length ? (
        <FormList forms={forms.data} />
      ) : (
        <EmptyState
          icon="clipboard"
          title={t('forms.noneYet')}
          description={t('forms.noneYetText')}
          action={
            <ButtonLink href="/tickets/new" size="sm">
              {t('tickets.submit')}
            </ButtonLink>
          }
        />
      )}
    </PortalShell>
  );
}
