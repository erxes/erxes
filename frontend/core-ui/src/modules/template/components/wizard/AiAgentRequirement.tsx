import { AiAgentDetailSheetContent } from '@/automations/components/settings/components/agents/components/AiAgentDetailSheetContent';
import { useAiAgentRequirement } from '@/template/hooks/useAiAgentRequirement';
import { IconPlus, IconRobot } from '@tabler/icons-react';
import { Button, Select, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TemplateRequirementOptions } from 'ui-modules';

// An existing agent lends its connection; its key stays on the server
export const AiAgentRequirement = ({
  value,
  onChange,
  onLabel,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  onLabel: (label: string | null) => void;
}) => {
  const { t } = useTranslation('templates');
  const {
    agentId,
    options,
    loading,
    showCards,
    select,
    isCreating,
    openCreate,
    closeCreate,
    handleCreated,
  } = useAiAgentRequirement(value, onChange, onLabel);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {!options.length && (
        <p className="text-sm text-muted-foreground">{t('no-agents')}</p>
      )}

      {showCards ? (
        <div className="w-full">
          <TemplateRequirementOptions
            options={options.map((option) => ({
              ...option,
              icon: <IconRobot className="size-4" />,
            }))}
            value={agentId}
            onSelect={select}
            createLabel={t('create-agent')}
            onCreate={openCreate}
          />
        </div>
      ) : (
        <>
          <Select value={agentId || undefined} onValueChange={select}>
            <Select.Trigger>
              <Select.Value placeholder={t('choose-agent')} />
            </Select.Trigger>
            <Select.Content>
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Button variant="ghost" size="sm" onClick={openCreate}>
            <IconPlus />
            {t('create-agent')}
          </Button>
        </>
      )}

      {isCreating && (
        <AiAgentDetailSheetContent
          onClose={closeCreate}
          onCreated={handleCreated}
          persistStepInUrl={false}
        />
      )}
    </div>
  );
};
