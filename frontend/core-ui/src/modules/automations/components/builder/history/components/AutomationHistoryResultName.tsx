import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { IconInfoTriangle } from '@tabler/icons-react';
import { CellContext } from '@tanstack/table-core';
import { splitAutomationNodeType, IAutomationHistory } from 'ui-modules';

export const AutomationHistoryResultName = ({
  cell,
}: CellContext<IAutomationHistory, unknown>) => {
  const { triggerType, target } = cell.row.original;
  const [pluginName, moduleName] = splitAutomationNodeType(triggerType);

  if (pluginName !== 'core' && moduleName) {
    return (
      <RenderPluginsComponentWrapper
        pluginName={pluginName}
        moduleName={moduleName}
        props={{
          componentType: 'historyName',
          triggerType,
          target,
        }}
      />
    );
  }

  if (pluginName && moduleName) {
    return (
      <p className="flex flex-row gap-2 items-center ml-4">
        {pluginName}
        {moduleName}
        <IconInfoTriangle className="size-3 text-destructive" />
      </p>
    );
  }

  return 'Empty';
};
