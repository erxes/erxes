import { type AutomationDefinition, Reentry } from '@erxes/core-contract';
import { Input, Select, Textarea } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf } from '~/lib/api';
import { ConditionsEditor } from './builder/ConditionsEditor';
import { FieldLabel } from './builder/FieldLabel';
import type { useAutomationDraft } from './useAutomationEditor';

/** What the server refused, and the steps the builder marks, each linking to its step. */
export const ProblemList = ({
  serverProblems,
  stepProblems,
  onSelect,
}: {
  serverProblems: string[];
  stepProblems: { stepId: string; title: string; first: string | undefined }[];
  onSelect: (stepId: string) => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <>
      {serverProblems.length > 0 && (
        <ul className="list-disc rounded-md border border-destructive/40 bg-destructive/5 p-3 pl-7 text-sm text-destructive">
          {serverProblems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
      {stepProblems.length > 0 && (
        <div className="space-y-1 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <p className="font-medium text-destructive">
            {t('needs-attention', 'These steps need attention')}
          </p>
          {stepProblems.map(({ stepId, title, first }) => (
            <button
              key={stepId}
              type="button"
              className="block w-full text-left text-destructive hover:underline"
              onClick={() => onSelect(stepId)}
            >
              {title}: {first}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

const ReentrySelect = ({
  definition,
  disabled,
  onChange,
}: {
  definition: AutomationDefinition;
  disabled: boolean;
  onChange: (definition: AutomationDefinition) => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <Select
      value={definition.reentry}
      disabled={disabled}
      onValueChange={(next) => {
        const reentry = Reentry.options.find((option) => option === next);

        if (reentry) onChange({ ...definition, reentry });
      }}
    >
      <Select.Trigger aria-label={t('reentry', 'The same record may run through')}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="always">{t('reentry-always', 'every time')}</Select.Item>
        <Select.Item value="daily">{t('reentry-daily', 'once a day')}</Select.Item>
        <Select.Item value="once">{t('reentry-once', 'only once')}</Select.Item>
      </Select.Content>
    </Select>
  );
};

/** Name, description, re-entry, hourly limit and goal. */
export const AutomationSettings = ({
  draft,
  editable,
  subject,
  skippedByLimit,
  fieldsError,
}: {
  draft: ReturnType<typeof useAutomationDraft>;
  editable: boolean;
  subject: 'customer' | 'company' | null;
  skippedByLimit: number;
  fieldsError: Error | null;
}) => {
  const { t } = useTranslation('automations');
  const id = useId();
  const { definition, setDefinition } = draft;

  return (
    <>
      <div className="space-y-1.5">
        <FieldLabel htmlFor={`${id}-name`}>{t('name', 'Name')}</FieldLabel>
        <Input
          id={`${id}-name`}
          value={draft.name}
          disabled={!editable}
          onChange={(event) => draft.change({ name: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <FieldLabel htmlFor={`${id}-description`}>{t('description', 'Description')}</FieldLabel>
        <Textarea
          id={`${id}-description`}
          rows={3}
          value={draft.description}
          disabled={!editable}
          placeholder={t('description-placeholder', 'What does it do, and why?')}
          onChange={(event) => draft.change({ description: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <FieldLabel>{t('reentry', 'The same record may run through')}</FieldLabel>
        <ReentrySelect definition={definition} disabled={!editable} onChange={setDefinition} />
      </div>
      <div className="space-y-1.5">
        <FieldLabel htmlFor={`${id}-limit`}>
          {t('limit', 'Start at most (runs an hour)')}
        </FieldLabel>
        <Input
          id={`${id}-limit`}
          type="number"
          min={1}
          placeholder={t('no-limit', 'no limit')}
          value={definition.maxRunsPerHour ?? ''}
          disabled={!editable}
          onChange={(event) =>
            setDefinition({
              ...definition,
              maxRunsPerHour: event.target.value
                ? Math.max(1, Number(event.target.value))
                : undefined,
            })
          }
        />
        {skippedByLimit > 0 && (
          <p className="text-xs text-warning">
            {t('skipped-by-limit', '{{count}} skipped by the limit', { count: skippedByLimit })}
          </p>
        )}
      </div>
      {fieldsError && (
        <p role="alert" className="text-sm text-destructive">
          {t('fields-failed', 'Could not load the record fields: {{message}}', {
            message: messageOf(fieldsError),
          })}
        </p>
      )}
      {subject && (
        <div className="space-y-1.5">
          <FieldLabel>
            {t('goal', 'Goal: once this holds, the record leaves the automation')}
          </FieldLabel>
          <ConditionsEditor
            subject={subject}
            value={definition.goal}
            disabled={!editable}
            onChange={(goal) => setDefinition({ ...definition, goal })}
          />
        </div>
      )}
    </>
  );
};
