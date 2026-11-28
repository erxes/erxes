import { type AutomationDefinition, Reentry } from '@erxes/core-contract';
import { Dialog, Input, Select, Textarea } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf } from '@erxes/core-contract/client';
import { ConditionsEditor } from './builder/ConditionsEditor';
import { FieldLabel } from './builder/FieldLabel';
import type { useBuilder } from './builder/useBuilder';
import type { useAutomationDraft } from './useAutomationEditor';

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
      <Select.Trigger aria-label={t('reentry', 'How often can the same record go through?')}>
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

/** At most so many runs an hour, and how many the limit skipped. */
const RunLimit = ({
  draft,
  editable,
  skippedByLimit,
}: {
  draft: ReturnType<typeof useAutomationDraft>;
  editable: boolean;
  skippedByLimit: number;
}) => {
  const { t } = useTranslation('automations');
  const id = useId();
  const { definition, setDefinition } = draft;

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id}>{t('limit', 'Start at most (runs an hour)')}</FieldLabel>
      <Input
        id={id}
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
  );
};

export const SettingsDialog = ({
  open,
  onOpenChange,
  draft,
  editable,
  built,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: ReturnType<typeof useAutomationDraft>;
  editable: boolean;
  built: ReturnType<typeof useBuilder>;
}) => {
  const { t } = useTranslation('automations');
  const subject = built.hasSubject ? built.subject : null;
  const skippedByLimit = built.stats.data?.skippedByLimit ?? 0;
  const { fieldsError } = built;
  const id = useId();
  const { definition, setDefinition } = draft;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="sm:max-w-lg">
        <Dialog.HeaderCombined
          title={t('settings', 'Settings')}
          description={t('settings-save-hint', 'Changes apply when you save.')}
        />
        <div className="space-y-5">
          <div className="space-y-1.5">
            <FieldLabel htmlFor={`${id}-description`}>{t('description', 'Note')}</FieldLabel>
            <Textarea
              id={`${id}-description`}
              rows={3}
              value={draft.description}
              disabled={!editable}
              placeholder={t('description-placeholder', 'What is this automation for?')}
              onChange={(event) => draft.change({ description: event.target.value })}
            />
          </div>
          {fieldsError && (
            <p role="alert" className="text-sm text-destructive-text">
              {t('fields-failed', 'Could not load the record fields: {{message}}', {
                message: messageOf(fieldsError),
              })}
            </p>
          )}
          <div className="space-y-1.5">
            <FieldLabel>{t('reentry', 'How often can the same record go through?')}</FieldLabel>
            <ReentrySelect definition={definition} disabled={!editable} onChange={setDefinition} />
          </div>
          <RunLimit draft={draft} editable={editable} skippedByLimit={skippedByLimit} />
          {subject && (
            <div className="space-y-1.5">
              <FieldLabel>{t('goal', 'Stop early once this is true')}</FieldLabel>
              <ConditionsEditor
                subject={subject}
                value={definition.goal}
                disabled={!editable}
                onChange={(goal) => setDefinition({ ...definition, goal })}
              />
            </div>
          )}
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
