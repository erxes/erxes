import type { AutomationStep, ConditionGroup } from '@erxes/core-contract';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useItemKeys } from '~/lib/useItemKeys';
import { ConditionsEditor } from './ConditionsEditor';
import type { FieldInfo } from './useAutomationFields';

type SwitchStep = Extract<AutomationStep, { type: 'switch' }>;

type SplitStep = Extract<AutomationStep, { type: 'split' }>;

const replaceAt = <T,>(items: T[], index: number, next: T) =>
  items.map((item, at) => (at === index ? next : item));

const emptyGroup = (): ConditionGroup => ({ match: 'all', rules: [] });

/** A switch's cases: the first that holds is taken. */
export const SwitchCases = ({
  step,
  subject,
  outputs,
  disabled,
  onChange,
}: {
  step: SwitchStep;
  subject: 'customer' | 'company';
  outputs: FieldInfo[];
  disabled?: boolean;
  onChange: (step: SwitchStep) => void;
}) => {
  const { t } = useTranslation('automations');
  const keys = useItemKeys(step.cases.length);

  const setCase = (index: number, next: SwitchStep['cases'][number]) =>
    onChange({ ...step, cases: replaceAt(step.cases, index, next) });

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {t('switch-hint', 'The first case that holds is taken; none: Otherwise.')}
      </p>
      {step.cases.map((item, index) => (
        <div key={keys.keyAt(index)} className="space-y-2 rounded-md border p-3">
          <div className="flex items-center gap-2">
            <Input
              className="h-8"
              value={item.label ?? ''}
              placeholder={t('case-n', 'Case {{n}}', { n: index + 1 })}
              disabled={disabled}
              onChange={(event) =>
                setCase(index, { ...item, label: event.target.value || undefined })
              }
            />
            {step.cases.length > 1 && (
              <Button
                size="icon"
                variant="ghost"
                disabled={disabled}
                aria-label={t('remove', 'Remove')}
                onClick={() => {
                  keys.removed(index);
                  onChange({ ...step, cases: step.cases.filter((_, at) => at !== index) });
                }}
              >
                <IconTrash />
              </Button>
            )}
          </div>
          <ConditionsEditor
            subject={subject}
            extraFields={outputs}
            value={item.conditions}
            disabled={disabled}
            onChange={(conditions) =>
              setCase(index, { ...item, conditions: conditions ?? emptyGroup() })
            }
          />
        </div>
      ))}
      {!disabled && step.cases.length < 10 && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            keys.added();
            onChange({
              ...step,
              cases: [...step.cases, { conditions: emptyGroup(), steps: [] }],
            });
          }}
        >
          <IconPlus />
          {t('add-case', 'Add case')}
        </Button>
      )}
    </div>
  );
};

/** A split's paths: each run takes one at random, by weight. */
export const SplitPaths = ({
  step,
  disabled,
  onChange,
}: {
  step: SplitStep;
  disabled?: boolean;
  onChange: (step: SplitStep) => void;
}) => {
  const { t } = useTranslation('automations');
  const keys = useItemKeys(step.paths.length);

  const setPath = (index: number, next: SplitStep['paths'][number]) =>
    onChange({ ...step, paths: replaceAt(step.paths, index, next) });

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {t('split-hint', 'Each run takes one path at random, by weight ({{total}} in all).', {
          total: step.paths.reduce((sum, path) => sum + path.weight, 0),
        })}
      </p>
      {step.paths.map((path, index) => (
        <div key={keys.keyAt(index)} className="flex items-center gap-2">
          <Input
            className="h-8"
            value={path.label ?? ''}
            placeholder={String.fromCharCode(65 + index)}
            disabled={disabled}
            onChange={(event) =>
              setPath(index, { ...path, label: event.target.value || undefined })
            }
          />
          <Input
            className="h-8 w-20"
            type="number"
            min={1}
            max={100}
            value={path.weight}
            disabled={disabled}
            onChange={(event) =>
              setPath(index, {
                ...path,
                weight: Math.min(100, Math.max(1, Number(event.target.value) || 1)),
              })
            }
          />
          <span className="text-sm text-muted-foreground">%</span>
          {step.paths.length > 2 && (
            <Button
              size="icon"
              variant="ghost"
              disabled={disabled}
              aria-label={t('remove', 'Remove')}
              onClick={() => {
                keys.removed(index);
                onChange({ ...step, paths: step.paths.filter((_, at) => at !== index) });
              }}
            >
              <IconTrash />
            </Button>
          )}
        </div>
      ))}
      {!disabled && step.paths.length < 5 && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            keys.added();
            onChange({ ...step, paths: [...step.paths, { weight: 50, steps: [] }] });
          }}
        >
          <IconPlus />
          {t('add-path', 'Add path')}
        </Button>
      )}
    </div>
  );
};
