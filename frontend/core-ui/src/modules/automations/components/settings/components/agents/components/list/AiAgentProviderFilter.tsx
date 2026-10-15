import { AiAgentProviderLogo } from '@/automations/components/settings/components/agents/components/AiAgentProviderLogo';
import { AI_AGENT_KINDS } from '@/automations/components/settings/components/agents/constants/automationAiAgents';
import { IconCheck } from '@tabler/icons-react';
import { Combobox, Command, useQueryState } from 'erxes-ui';

export const AiAgentProviderFilter = () => {
  const [kind, setKind] = useQueryState<string>('kind');

  return (
    <Command shouldFilter={false}>
      <Command.List className="p-1">
        <Combobox.Empty />
        {AI_AGENT_KINDS.map(({ type, label }) => (
          <Command.Item
            key={type}
            value={type}
            className="cursor-pointer"
            onSelect={() => setKind(type === kind ? null : type)}
          >
            <AiAgentProviderLogo provider={type} />
            {label}
            {kind === type && <IconCheck className="ml-auto" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
