import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import {
  CoreTemplateRequirement,
  isCoreTemplateRequirement,
} from '@/automations/components/builder/template/CoreTemplateRequirement';
import { TTemplateRequirement } from '@/template/types';
import { AiAgentRequirement } from '@/template/components/wizard/AiAgentRequirement';
import { splitAutomationNodeType } from 'ui-modules';

type TProps = {
  requirement: TTemplateRequirement;
  value: unknown;
  dependsOnValue: unknown;
  onChange: (value: unknown) => void;
  onLabel: (label: string | null) => void;
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
  onLabel,
}: TProps) => {
  const { kind, input } = requirement;

  if (kind === 'automations:aiAgent') {
    return (
      <AiAgentRequirement value={value} onChange={onChange} onLabel={onLabel} />
    );
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
        onLabel,
      }}
    />
  );
};
