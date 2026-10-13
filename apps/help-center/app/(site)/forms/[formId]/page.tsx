import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPortalForm } from '@/modules/forms/api';
import { FormView } from '@/modules/forms/components/FormView';
import { formTitle } from '@/modules/forms/types';
import { getT } from '@/modules/i18n/server';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

type Props = { params: Promise<{ formId: string }> };

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { formId } = await params;
  const [form, t] = await Promise.all([getPortalForm(formId), getT()]);

  return {
    title:
      form.state === 'ready' && form.data
        ? formTitle(form.data, t)
        : t('nav.form'),
  };
};

export default async function FormPage({ params }: Props) {
  const { formId } = await params;
  const [form, t] = await Promise.all([getPortalForm(formId), getT()]);

  if (form.state === 'ready' && !form.data) {
    notFound();
  }

  return (
    <PortalShell
      breadcrumbs={[
        { label: t('nav.home'), href: '/' },
        { label: t('nav.forms'), href: '/forms' },
        {
          label:
            form.state === 'ready' && form.data
              ? formTitle(form.data, t)
              : t('nav.form'),
        },
      ]}
    >
      {form.state === 'unconfigured' ? (
        <div className="">
          <SetupNotice missing={form.missing} />
        </div>
      ) : form.state === 'unpublished' ? (
        <div className="">
          <Unpublished domain={form.domain} />
        </div>
      ) : form.state === 'error' ? (
        <div className="">
          <LoadError title={t('forms.loadOneFailed')} message={form.message} />
        </div>
      ) : form.data ? (
        <div className="">
          <FormView form={form.data} />
        </div>
      ) : null}
    </PortalShell>
  );
}
