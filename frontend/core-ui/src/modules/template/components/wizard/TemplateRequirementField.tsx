import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import {
  CoreTemplateRequirement,
  isCoreTemplateRequirement,
} from '@/automations/components/builder/template/CoreTemplateRequirement';
import { useAiAgents } from '@/automations/components/settings/components/agents/hooks/useAiAgents';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { TTemplateRequirement } from '@/template/types';
import { Button, Select, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { splitAutomationNodeType } from 'ui-modules';

type TProps = {
  requirement: TTemplateRequirement;
  value: unknown;
  dependsOnValue: unknown;
  onChange: (value: unknown) => void;
};

// An existing agent lends its connection; its key stays on the server
const AiAgentRequirement = ({
  value,
  onChange,
}: Pick<TProps, 'value' | 'onChange'>) => {
  const { t } = useTranslation('templates');
  const { automationsAiAgents, loading } = useAiAgents();

  if (loading) {
    return <Spinner />;
  }

  if (!automationsAiAgents.length) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t('no-agents')}</p>
        <Button variant="secondary" asChild>
          <Link to={AutomationSettingsPath.AgentCreate}>
            {t('create-agent')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Select
      value={typeof value === 'string' ? value : undefined}
      onValueChange={(agentId) => onChange(agentId)}
    >
      <Select.Trigger>
        <Select.Value placeholder={t('choose-agent')} />
      </Select.Trigger>
      <Select.Content>
        {automationsAiAgents.map((agent) => (
          <Select.Item key={agent._id} value={agent._id}>
            {agent.name}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

/**
 * One answer the template needs. Core answers its own kinds here; any other
 * kind is answered by the component of the plugin that owns it, the same one
 * broadcast templates use.
 */
export const TemplateRequirementField = ({
  requirement,
  value,
  dependsOnValue,
  onChange,
}: TProps) => {
  const { kind, input } = requirement;

  if (kind === 'automations:aiAgent') {
    return <AiAgentRequirement value={value} onChange={onChange} />;
  }

  if (isCoreTemplateRequirement(kind)) {
    return (
      <CoreTemplateRequirement
        kind={kind}
        value={value}
        input={input}
        onChange={onChange}
      />
    );
  }

  const [pluginName, moduleName] = splitAutomationNodeType(kind);

  return (
    <RenderPluginsComponentWrapper
      pluginName={pluginName}
      moduleName={moduleName}
      props={{
        componentType: 'templateRequirement',
        kind,
        value,
        dependsOnValue,
        onChange,
      }}
    />
  );
};
