import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationTrigger } from '@/automations/components/builder/hooks/useAutomationTrigger';
import {
  getCoreAutomationActionComponent,
  isCoreAutomationActionType,
} from '@/automations/components/builder/nodes/actions/coreAutomationActions';
import { NodeData } from '@/automations/types';
import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { Handle, Position } from '@xyflow/react';
import {
  AutomationActionNodeConfigProps,
  splitAutomationNodeType,
  TAutomationAction,
} from 'ui-modules';
import { TAutomationActionComponent } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export const useActionNodeConfiguration = (
  data: NodeData,
  actionData: TAutomationAction,
) => {
  const { id, type = '', config } = data || {};
  const [pluginName, moduleName] = splitAutomationNodeType(type);
  const { trigger } = useAutomationTrigger(id);

  let Component = null;

  if (
    isCoreAutomationActionType(type, TAutomationActionComponent.NodeContent)
  ) {
    const CoreActionComponent = getCoreAutomationActionComponent(
      type,
      TAutomationActionComponent.NodeContent,
    );

    Component = (
      <div className="px-4 py-2">
        {CoreActionComponent ? (
          <CoreActionComponent nodeData={data} config={config} />
        ) : (
          <></>
        )}
      </div>
    );
  } else {
    const actionNodeProps: AutomationActionNodeConfigProps = {
      componentType: 'actionNodeConfiguration',
      type,
      config,
      trigger,
      actionData,
    };

    Component = (
      <RenderPluginsComponentWrapper
        pluginName={pluginName}
        moduleName={moduleName}
        props={actionNodeProps}
      />
    );
  }

  return { Component };
};

export const createOptionConnectHandle = ({
  id,
  isAvailableOptionalConnect,
}: {
  id: string;
  isAvailableOptionalConnect?: boolean;
}) => {
  if (!isAvailableOptionalConnect) {
    return <></>;
  }
  return ({ optionalId }: { optionalId: string }) => {
    return (
      <Handle
        key={`${id}-${optionalId}-right`}
        id={`${id}-${optionalId}-right`}
        type="source"
        position={Position.Right}
        className={
          '!right-4 !size-4 !bg-background !border !border-2 !rounded-full !border-accent-foreground !z-4'
        }
        isConnectable
        title="optional-connect"
      />
    );
  };
};
