import { DecisionProvider } from '@erxes/core-contract';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, cn, ConnectionPicker, Input, useItemKeys } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useIntegrations } from '~/modules/settings/integrations/catalog';
import {
  IntegrationMark,
  IntegrationStatusBadge,
} from '~/modules/settings/integrations/IntegrationStatusBadge';
import { Field } from './Field';
import type { SettingsProps } from './stepSettingsProps';
import { TemplateInput } from './TemplateInput';
import { useStepData } from './useStepData';

type DecideProps = SettingsProps<'decide'>;

type Path = DecideProps['step']['paths'][number];

const MAX_PATHS = 10;

const PROVIDER_NAMES: Record<DecideProps['step']['provider'], string> = {
  typesafe: 'TypeSafe',
  openai: 'OpenAI',
};

const Providers = ({ step, disabled, onChange }: DecideProps) => {
  const { integrations } = useIntegrations();

  return (
    <div className="space-y-1.5">
      {DecisionProvider.options.map((provider) => {
        const integration = integrations.find((item) => item.key === provider);
        const picked = step.provider === provider;

        return (
          <button
            key={provider}
            type="button"
            disabled={disabled}
            aria-pressed={picked}
            onClick={() =>
              picked ||
              onChange({
                ...step,
                provider,
                connection: undefined,
                model: undefined,
                minConfidence: undefined,
              })
            }
            className={cn(
              'flex w-full items-center gap-3 rounded-lg border p-2 text-left text-sm transition-colors hover:bg-accent/50',
              picked && 'border-primary ring-1 ring-primary',
            )}
          >
            {integration && <IntegrationMark integration={integration} />}
            <span className="min-w-0 flex-1 font-medium">
              {integration?.name ?? PROVIDER_NAMES[provider]}
            </span>
            {integration && integration.status.state !== 'not-set-up' && (
              <IntegrationStatusBadge status={integration.status} />
            )}
          </button>
        );
      })}
    </div>
  );
};

const invalidPathAt = (paths: Path[], index: number) => {
  const label = paths[index]?.label.trim().toLowerCase() ?? '';

  if (!label || label === 'otherwise') return true;

  return paths.some((other, at) => at !== index && other.label.trim().toLowerCase() === label);
};

const Paths = ({ step, disabled, onChange }: DecideProps) => {
  const { t } = useTranslation('automations');
  const keys = useItemKeys(step.paths.length);

  const setPath = (index: number, next: Path) =>
    onChange({ ...step, paths: step.paths.map((path, at) => (at === index ? next : path)) });

  return (
    <div className="space-y-2">
      {step.paths.map((path, index) => (
        <div key={keys.keyAt(index)} className="space-y-1.5 rounded-md border p-2">
          <div className="flex items-center gap-2">
            <Input
              className="h-8"
              aria-invalid={invalidPathAt(step.paths, index) || undefined}
              value={path.label}
              maxLength={60}
              placeholder={t('path-n', 'Path {{n}}', { n: index + 1 })}
              disabled={disabled}
              onChange={(event) => setPath(index, { ...path, label: event.target.value })}
            />
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
          <Input
            className="h-8"
            value={path.meaning ?? ''}
            maxLength={500}
            placeholder={t('path-meaning', 'When it means…')}
            disabled={disabled}
            onChange={(event) =>
              setPath(index, { ...path, meaning: event.target.value || undefined })
            }
          />
        </div>
      ))}
      {!disabled && step.paths.length < MAX_PATHS && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            keys.added();
            onChange({
              ...step,
              paths: [
                ...step.paths,
                { label: t('path-n', 'Path {{n}}', { n: step.paths.length + 1 }), steps: [] },
              ],
            });
          }}
        >
          <IconPlus />
          {t('add-path', 'Add path')}
        </Button>
      )}
    </div>
  );
};

const Confidence = ({ step, disabled, onChange }: DecideProps) => {
  const { t } = useTranslation('automations');

  return (
    <Field
      label={t('min-confidence', 'Minimum confidence')}
      info={t('min-confidence-info', 'Less sure than this: the run takes Otherwise')}
    >
      <div className="flex items-center gap-2">
        <Input
          className="w-24"
          type="number"
          min={0}
          max={100}
          value={step.minConfidence === undefined ? '' : Math.round(step.minConfidence * 100)}
          placeholder="0"
          disabled={disabled}
          onChange={(event) => {
            const raw = event.target.value;
            const parsed = Number(raw);

            onChange({
              ...step,
              minConfidence:
                raw === '' || !Number.isFinite(parsed)
                  ? undefined
                  : Math.min(100, Math.max(0, parsed)) / 100,
            });
          }}
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>
    </Field>
  );
};

export const DecideSettings = (props: DecideProps) => {
  const { t } = useTranslation('automations');
  const { step, subject, disabled, onChange } = props;
  const dataFields = useStepData(step.id, subject);

  return (
    <>
      <Field label={t('decision-model', 'Decision model')}>
        <Providers {...props} />
      </Field>
      <Field label={t('connection', 'Connection')}>
        <ConnectionPicker
          key={step.provider}
          integration={step.provider}
          value={step.connection ?? null}
          onValueChange={(connection) => onChange({ ...step, connection: connection ?? undefined })}
          noneLabel={t('default-connection', 'The default connection')}
          disabled={disabled}
        />
      </Field>
      <Field label={t('model', 'Model')}>
        <Input
          value={step.model ?? ''}
          maxLength={100}
          placeholder={step.provider === 'typesafe' ? 'jev-latest' : t('default-model', 'Default')}
          disabled={disabled}
          onChange={(event) => onChange({ ...step, model: event.target.value || undefined })}
        />
      </Field>
      <Field label={t('decision-question', 'Question')} required invalid={!step.question.trim()}>
        <TemplateInput
          label={t('decision-question', 'Question')}
          value={step.question}
          onChange={(question) => onChange({ ...step, question })}
          fields={dataFields}
          subject={subject}
          placeholder={t('decision-question-placeholder', 'Which team should take this?')}
          invalid={!step.question.trim()}
          disabled={disabled}
        />
      </Field>
      <Field label={t('decision-state', 'What it reads')}>
        <TemplateInput
          label={t('decision-state', 'What it reads')}
          value={step.state}
          onChange={(state) => onChange({ ...step, state })}
          fields={dataFields}
          subject={subject}
          multiline
          placeholder={t('decision-state-placeholder', 'Empty: the record and the event')}
          disabled={disabled}
        />
      </Field>
      <Field label={t('decision-paths', 'Paths')}>
        <Paths {...props} />
      </Field>
      {step.provider === 'typesafe' && <Confidence {...props} />}
    </>
  );
};
