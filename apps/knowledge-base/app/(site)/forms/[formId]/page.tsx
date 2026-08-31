import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPortalForm } from '@/modules/forms/api';
import { FormView } from '@/modules/forms/components/FormView';
import { formTitle } from '@/modules/forms/types';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { Container } from '@/modules/ui/components/Container';
import { LoadError, SetupNotice } from '@/modules/ui/components/PortalState';

type Props = { params: Promise<{ formId: string }> };

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { formId } = await params;
  const form = await getPortalForm(formId);

  return {
    title:
      form.state === 'ready' && form.data ? formTitle(form.data) : 'Маягт',
  };
};

export default async function FormPage({ params }: Props) {
  const { formId } = await params;
  const [{ headline }, form] = await Promise.all([
    getPortalIdentity(),
    getPortalForm(formId),
  ]);

  if (form.state === 'ready' && !form.data) {
    notFound();
  }

  return (
    <>
      <Hero headline={headline} />

      <Container column="text" className="py-10 lg:py-14">
        <Breadcrumbs
          items={[
            { label: 'Мэдлэгийн сан', href: '/' },
            { label: 'Маягт', href: '/forms' },
            {
              label:
                form.state === 'ready' && form.data
                  ? formTitle(form.data)
                  : 'Маягт',
            },
          ]}
        />

        {form.state === 'unconfigured' ? (
          <div className="mt-7">
            <SetupNotice missing={form.missing} />
          </div>
        ) : form.state === 'error' ? (
          <div className="mt-7">
            <LoadError title="Маягтыг татаж чадсангүй" message={form.message} />
          </div>
        ) : form.data ? (
          <>
            <h1 className="mt-6 text-[28px] font-semibold leading-snug text-ink">
              {formTitle(form.data)}
            </h1>
            {form.data.description?.trim() ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {form.data.description}
              </p>
            ) : null}

            <div className="mt-7">
              <FormView form={form.data} />
            </div>
          </>
        ) : null}
      </Container>
    </>
  );
}
