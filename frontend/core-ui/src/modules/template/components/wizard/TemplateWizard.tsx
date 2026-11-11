import { TemplateRequirementField } from '@/template/components/wizard/TemplateRequirementField';
import { useTemplateWizard } from '@/template/hooks/useTemplateWizard';
import { TTemplate } from '@/template/types';
import { isTemplateAnswered } from '@/template/utils/templateWizard';
import {
  IconArrowRight,
  IconCheck,
  IconLock,
  IconRobot,
  IconSitemap,
} from '@tabler/icons-react';
import { Button, Card, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * Steps on the left, the open step in the middle, what will be created on
 * the right. A step after an unanswered one stays locked, and installing
 * stays closed until every step has an answer.
 */
export const TemplateWizard = ({ template }: { template: TTemplate }) => {
  const { t } = useTranslation('templates');
  const {
    requirements,
    answers,
    answer,
    stepIndex,
    goToStep,
    goNext,
    isStepOpen,
    remaining,
    submit,
    installing,
  } = useTemplateWizard(template);
  const current = requirements[stepIndex];

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
      <ol className="space-y-1" aria-label={t('steps')}>
        {requirements.map((requirement, index) => {
          const open = isStepOpen(index);
          const done = isTemplateAnswered(answers[requirement.key]);

          return (
            <li key={requirement.key}>
              <button
                type="button"
                disabled={!open}
                onClick={() => goToStep(index)}
                className={cn(
                  'flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm',
                  index === stepIndex && 'bg-accent',
                  !open && 'cursor-not-allowed opacity-50',
                )}
              >
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                  {done ? (
                    <IconCheck className="size-4 text-success" />
                  ) : open ? (
                    <span className="text-xs text-muted-foreground">
                      {index + 1}
                    </span>
                  ) : (
                    <IconLock className="size-3.5 text-muted-foreground" />
                  )}
                </span>
                <span className="min-w-0">{requirement.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <Card className="flex flex-col gap-4 p-5">
        {current ? (
          <>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t('step-of', {
                  index: stepIndex + 1,
                  total: requirements.length,
                })}
              </p>
              <h2 className="text-base font-semibold">{current.label}</h2>
              {current.description && (
                <p className="text-sm text-muted-foreground">
                  {current.description}
                </p>
              )}
            </div>
            <TemplateRequirementField
              key={current.key}
              requirement={current}
              value={answers[current.key]}
              dependsOnValue={
                current.dependsOn ? answers[current.dependsOn] : undefined
              }
              onChange={(value) => answer(current.key, value)}
            />
            <div className="mt-auto flex justify-end">
              <Button
                variant="secondary"
                disabled={!isTemplateAnswered(answers[current.key])}
                onClick={goNext}
              >
                {t('next')}
                <IconArrowRight />
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t('nothing-to-ask')}</p>
        )}
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="space-y-3 p-4">
          <p className="text-sm font-semibold">{t('will-create')}</p>
          {template.parts.map((part) => (
            <p key={part.key} className="flex items-center gap-2 text-sm">
              <IconRobot className="size-4 text-muted-foreground" />
              {t('ai-agent')}
            </p>
          ))}
          {template.journeys.map((journey) => (
            <div key={journey.key} className="flex items-start gap-2 text-sm">
              <IconSitemap className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p>{journey.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t('draft-steps', { count: journey.stepCount })}
                </p>
              </div>
            </div>
          ))}
        </Card>
        <Button disabled={!!remaining || installing} onClick={submit}>
          {remaining
            ? t('steps-left', { count: remaining })
            : installing
            ? t('installing')
            : t('install')}
        </Button>
        <p className="text-xs text-muted-foreground">{t('install-note')}</p>
      </div>
    </div>
  );
};
