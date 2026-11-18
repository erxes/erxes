import { TemplateStepRow } from '@/template/components/wizard/TemplateStepRow';
import { useTemplateWizardContext } from '@/template/context/TemplateWizardContext';
import { TTemplateRequirement } from '@/template/types';
import {
  isTemplateAnswered,
  TTemplateStepGroup,
} from '@/template/utils/templateWizard';
import { useTranslation } from 'react-i18next';

/** Steps about the same kind of thing: connections, people or wording. */
export const TemplateStepGroup = ({
  group,
  steps,
}: {
  group: TTemplateStepGroup;
  steps: { requirement: TTemplateRequirement; index: number }[];
}) => {
  const { t } = useTranslation('templates');
  const { answers } = useTemplateWizardContext();
  const done = steps.filter(({ requirement }) =>
    isTemplateAnswered(answers[requirement.key]),
  ).length;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t(`group-${group}`)}
        </h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {done}/{steps.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {steps.map(({ requirement, index }) => (
          <TemplateStepRow
            key={requirement.key}
            requirement={requirement}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};
