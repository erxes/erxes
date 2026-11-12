import { TemplateFlowPreview } from '@/template/components/TemplateFlowPreview';
import { useTemplateWizardContext } from '@/template/context/TemplateWizardContext';
import { useTemplatePreview } from '@/template/hooks/useTemplatePreview';
import { IconComponent } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/** Which employee is being set up, and the flow it runs. */
export const TemplateWizardHeader = () => {
  const { t } = useTranslation('templates');
  const { template, total } = useTemplateWizardContext();
  const preview = useTemplatePreview(template);

  if (!template) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-primary/20 via-primary/10 to-primary/5 p-6">
      <span className="absolute -left-10 -top-16 size-40 rounded-full bg-primary/25 blur-3xl" />
      <span className="absolute -bottom-20 right-10 size-40 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <IconComponent
              name={template.icon || 'IconSparkles'}
              className="size-6"
            />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {template.name}
            </h1>
            {template.description && (
              <p className="max-w-prose text-sm text-muted-foreground">
                {template.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {[
                t('steps-to-answer', { count: total }),
                t('automation-count', { count: template.journeys.length }),
              ].join(' · ')}
            </p>
          </div>
        </div>
        {preview && <TemplateFlowPreview preview={preview} inline />}
      </div>
    </section>
  );
};
