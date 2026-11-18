import { TemplatePriorInstallsAlert } from '@/template/components/wizard/TemplatePriorInstallsAlert';
import { TemplateStepGroup } from '@/template/components/wizard/TemplateStepGroup';
import { TemplateWizardHeader } from '@/template/components/wizard/TemplateWizardHeader';
import {
  TemplateWizardMobileBar,
  TemplateWizardSummary,
} from '@/template/components/wizard/TemplateWizardSummary';
import {
  TemplateWizardProvider,
  useTemplateWizardContext,
} from '@/template/context/TemplateWizardContext';
import { TTemplate } from '@/template/types';
import { useTranslation } from 'react-i18next';

const TemplateWizardSteps = () => {
  const { t } = useTranslation('templates');
  const { groups } = useTemplateWizardContext();

  if (!groups.length) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        {t('nothing-to-ask')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ group, steps }) => (
        <TemplateStepGroup key={group} group={group} steps={steps} />
      ))}
    </div>
  );
};

/**
 * The employee on top, its steps as rows that open one at a time, and what
 * gets created beside them. Defaults are filled in, so a first install is
 * mostly reading down the list and pressing install.
 */
export const TemplateWizard = ({ template }: { template: TTemplate }) => (
  <TemplateWizardProvider template={template}>
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-5">
        <TemplateWizardHeader />
        <TemplatePriorInstallsAlert />
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <TemplateWizardSteps />
          {/* Level with the first step, under its group's heading */}
          <div className="lg:sticky lg:top-5 lg:mt-7">
            <TemplateWizardSummary />
          </div>
        </div>
      </div>
      <TemplateWizardMobileBar />
    </div>
  </TemplateWizardProvider>
);
