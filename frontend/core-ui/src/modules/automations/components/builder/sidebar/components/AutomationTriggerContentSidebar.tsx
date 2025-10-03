import { useCustomTriggerContent } from '@/automations/components/builder/sidebar/hooks/useCustomTriggerContent';
import { useDefaultTriggerContent } from '@/automations/components/builder/sidebar/hooks/useDefaultTriggerContent';
import { NodeData } from '@/automations/types';
import { RenderPluginsComponentWrapper } from '@/automations/utils/RenderPluginsComponentWrapper';
import { Button } from 'erxes-ui';
import { useRef } from 'react';
import { SegmentForm } from 'ui-modules';

type Props = { activeNode: NodeData };

const DefaultTriggerContent = ({ activeNode }: Props) => {
  const { contentId, handleCallback } = useDefaultTriggerContent({
    activeNode,
  });
  return (
    <SegmentForm
      contentType={activeNode?.type || ''}
      segmentId={contentId}
      callback={handleCallback}
      isTemporary
    />
  );
};

const CustomTriggerContent = ({ activeNode }: Props) => {
  const formRef = useRef<{ submit: () => void }>(null);

  const { pluginName, moduleName, activeTrigger, onSaveTriggerConfig } =
    useCustomTriggerContent(activeNode);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 w-auto">
        <RenderPluginsComponentWrapper
          pluginName={pluginName}
          moduleName={moduleName}
          props={{
            formRef: formRef,
            componentType: 'triggerForm',
            activeTrigger,
            onSaveTriggerConfig,
          }}
        />
      </div>
      <div className="p-2 flex justify-end border-t bg-white">
        <Button onClick={() => formRef.current?.submit()}>Save</Button>
      </div>
    </div>
  );
};

export const AutomationTriggerContentSidebar = ({ activeNode }: Props) => {
  if (activeNode?.isCustom) {
    return <CustomTriggerContent activeNode={activeNode} />;
  }

  return (
    <div className="w-[650px] flex flex-col max-h-full">
      <DefaultTriggerContent activeNode={activeNode} />
    </div>
  );
};
