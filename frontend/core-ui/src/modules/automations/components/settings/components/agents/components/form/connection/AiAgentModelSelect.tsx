import { TAiAgentModelOption } from '@/automations/components/settings/components/agents/hooks/useAiAgentModelOptions';
import { useAiAgentModelSelect } from '@/automations/components/settings/components/agents/hooks/useAiAgentModelSelect';
import {
  formatModelLabel,
  modelHintOf,
} from '@/automations/components/settings/components/agents/utils/aiAgentModelLabels';
import { IconPlus } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Combobox,
  Command,
  Form,
  Popover,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const AiAgentModelStatusBadge = ({
  option,
}: {
  option: TAiAgentModelOption;
}) => {
  const { t } = useTranslation('automations');

  if (option.status === 'deprecated') {
    return (
      <Badge variant="warning">{t('settings-model-status-deprecated')}</Badge>
    );
  }

  if (option.status === 'unavailable') {
    return (
      <Badge variant="destructive">
        {t('settings-model-status-unavailable')}
      </Badge>
    );
  }

  if (option.reasoning) {
    return <Badge variant="secondary">{t('settings-model-reasoning')}</Badge>;
  }

  return null;
};

const AiAgentModelHint = ({
  option,
  onSwitch,
}: {
  option?: TAiAgentModelOption;
  onSwitch: (model: string) => void;
}) => {
  const { t } = useTranslation('automations');
  const hint = modelHintOf(option);

  if (!hint) {
    return null;
  }

  if (hint.kind === 'unverified') {
    return (
      <p className="text-xs text-muted-foreground">
        {t('settings-model-unverified-hint')}
      </p>
    );
  }

  const { suggestion } = hint;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className={hint.tone}>{t(hint.messageKey)}</span>
      {suggestion && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onSwitch(suggestion)}
        >
          {t('settings-model-switch-to', {
            model: formatModelLabel(suggestion),
          })}
        </Button>
      )}
    </div>
  );
};

export const AiAgentModelSelect = () => {
  const { t } = useTranslation('automations');
  const {
    control,
    open,
    setOpen,
    search,
    setSearch,
    groups,
    selectedOption,
    customModel,
    loading,
    error,
    selectModel,
  } = useAiAgentModelSelect();

  return (
    <Form.Field
      control={control}
      name="connection.model"
      render={({ field }) => {
        const select = selectModel(field.onChange);

        return (
          <Form.Item>
            <Form.Label>{t('settings-agents-column-model')}</Form.Label>
            <Popover open={open} onOpenChange={setOpen}>
              <Form.Control>
                <Combobox.Trigger className="w-full">
                  <Combobox.Value
                    value={field.value ? formatModelLabel(field.value) : ''}
                    placeholder={t('settings-connection-select-model')}
                  />
                  {selectedOption && (
                    <AiAgentModelStatusBadge option={selectedOption} />
                  )}
                </Combobox.Trigger>
              </Form.Control>
              <Combobox.Content className="max-w-none">
                <Command shouldFilter>
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder={t('settings-model-search')}
                    focusOnMount
                  />
                  <Command.List>
                    {loading && (
                      <div className="flex justify-center p-4">
                        <Spinner />
                      </div>
                    )}
                    {!loading && error && (
                      <p className="p-3 text-xs text-destructive">
                        {t('settings-model-load-failed')}
                      </p>
                    )}
                    {!loading && (
                      <Command.Empty>{t('settings-model-empty')}</Command.Empty>
                    )}
                    {groups.map(({ group, options }) => (
                      <Command.Group
                        key={group}
                        heading={t(`settings-model-group-${group}`)}
                      >
                        {options.map((option) => (
                          <Command.Item
                            key={option.id}
                            value={option.id}
                            onSelect={() => select(option.id)}
                          >
                            <span className="truncate">
                              {formatModelLabel(option.id)}
                            </span>
                            <span className="ml-auto flex items-center gap-1">
                              <AiAgentModelStatusBadge option={option} />
                              <Combobox.Check
                                checked={field.value === option.id}
                              />
                            </span>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    ))}
                    {customModel && (
                      <Command.Group forceMount>
                        <Command.Item
                          forceMount
                          value={`custom:${customModel}`}
                          onSelect={() => select(customModel)}
                        >
                          <IconPlus />
                          {t('settings-model-use-custom', {
                            model: customModel,
                          })}
                        </Command.Item>
                      </Command.Group>
                    )}
                  </Command.List>
                </Command>
              </Combobox.Content>
            </Popover>
            <Form.Description>
              {t('settings-connection-model-description')}
            </Form.Description>
            <AiAgentModelHint option={selectedOption} onSwitch={select} />
            <Form.Message />
          </Form.Item>
        );
      }}
    />
  );
};
