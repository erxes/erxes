import { useTranslation } from 'react-i18next';
import { ISurveyStepResult } from '@/survey/types/surveyTypes';

export const SurveyStepResults = ({
  steps,
  showStepLabel,
}: {
  steps: ISurveyStepResult[];
  showStepLabel: boolean;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <div key={step._id} className="flex flex-col gap-1.5">
          {showStepLabel && (
            <p className="text-xs font-mono uppercase text-muted-foreground">
              {step.name || `${t('survey-step', 'Step')} ${index + 1}`}
            </p>
          )}
          <p className="text-sm font-medium">{step.question}</p>
          {step.options.map((option) => (
            <div
              key={option._id}
              className="relative overflow-hidden rounded border bg-accent/40 px-3 py-2"
            >
              <div
                className="absolute inset-y-0 left-0 bg-primary/15"
                style={{ width: `${option.percent}%` }}
              />
              <div className="relative flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{option.text}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {option.count} · {option.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
