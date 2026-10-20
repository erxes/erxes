import { useAiAgentToolBranchActions } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentToolBranchActions';
import { useAiAgentToolMemorizeFields } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentToolMemorizeFields';
import { Checkbox, Label, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TAutomationAction } from 'ui-modules';

export const AiAgentToolMemorizeFields = ({
  index,
  toolId,
}: {
  index: number;
  toolId: string;
}) => {
  const { t } = useTranslation('automations');
  const branchActions = useAiAgentToolBranchActions(toolId);

  return (
    <div className="flex flex-col gap-2">
      <Label>{t('ai-agent-tool-memorize')}</Label>
      <p className="text-sm text-muted-foreground">
        {t('ai-agent-tool-memorize-hint')}
      </p>
      {branchActions.length ? (
        branchActions.map((action) => (
          <AiAgentToolMemorizeActionFields
            key={action.id}
            index={index}
            action={action}
          />
        ))
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('ai-agent-tool-memorize-empty')}
        </p>
      )}
    </div>
  );
};

const AiAgentToolMemorizeActionFields = ({
  index,
  action,
}: {
  index: number;
  action: TAutomationAction;
}) => {
  const { t } = useTranslation('automations');
  const { loading, variables, remembersRecord, isChecked, isAlways, toggle } =
    useAiAgentToolMemorizeFields({ index, action });

  return (
    <div className="flex flex-col gap-1.5 rounded-md border p-2">
      <span className="text-sm font-medium">{action.label}</span>
      {remembersRecord && (
        <p className="text-xs text-muted-foreground">
          {t('ai-agent-tool-memorize-record')}
        </p>
      )}
      {loading && <Spinner size="sm" />}
      {variables.map(({ key, label }) => {
        const id = `memorize-${index}-${action.id}-${key}`;

        return (
          <div key={key} className="flex items-center gap-2">
            <Checkbox
              id={id}
              checked={isChecked(key)}
              disabled={isAlways(key)}
              onCheckedChange={(value) => toggle(key, value === true)}
            />
            <Label htmlFor={id} className="font-normal">
              {label}
            </Label>
          </div>
        );
      })}
    </div>
  );
};
