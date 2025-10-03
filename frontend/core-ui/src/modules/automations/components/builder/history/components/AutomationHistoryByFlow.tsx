import {
  generateEdges,
  generateNodes,
} from '@/automations/utils/automationBuilderUtils';
import { IconCheck, IconQuestionMark, IconX } from '@tabler/icons-react';
import { Background, ConnectionMode, Controls, ReactFlow } from '@xyflow/react';
import dayjs from 'dayjs';
import { Badge, Label, Separator, Tooltip } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import {
  IAutomationHistory,
  IAutomationsActionConfigConstants,
  IAutomationsTriggerConfigConstants,
} from 'ui-modules';
import PrimaryEdge from '../../edges/PrimaryEdge';
import ActionNode from '../../nodes/ActionNode';
import TriggerNode from '../../nodes/TriggerNode';
import { ExecutionActionResult } from './AutomationHistoryByTable';
import { AutomationNodeType } from '@/automations/types';

const nodeTypes = {
  trigger: TriggerNode as any,
  action: ActionNode as any,
};
const edgeTypes = {
  primary: PrimaryEdge,
};

const useBeforeTitleContent = (history: IAutomationHistory) => {
  const beforeTitleContent = (id: string, type: AutomationNodeType) => {
    const statusesMap = {
      success: { icon: IconCheck, color: 'success' },
      error: { icon: IconX, color: 'error' },
      unknown: { icon: IconQuestionMark, color: 'accent' },
    };

    let status: 'success' | 'error' | 'unknown' = 'unknown';
    let createdAt;
    let content;

    if (type === 'trigger' && history.triggerId === id) {
      status = 'success';
      createdAt = history.createdAt;
      content = <Badge>Passed</Badge>;
    } else if (type === 'action') {
      const action = history?.actions?.find((a) => a.actionId === id);
      status = action?.result?.error ? 'error' : action ? 'success' : 'unknown';
      createdAt = action?.createdAt;
      content = action ? <ExecutionActionResult action={action} /> : '';
    }

    if (status === 'unknown') {
      return null;
    }

    const { icon: Icon, color } = statusesMap[status];

    return (
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger>
            <div
              className={`text-${color} bg-${color}/10 p-1 border border-${color} rounded`}
            >
              <Icon className="w-4 h-4" />
            </div>
          </Tooltip.Trigger>
          <Tooltip.Content className=" flex flex-col gap-2">
            {createdAt && (
              <Label>{dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}</Label>
            )}
            <Separator />
            <div className="flex justify-center text-primary">{content}</div>
          </Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    );
  };

  return { beforeTitleContent };
};

export const AutomationHistoryByFlow = ({
  constants,
  history,
}: {
  history: IAutomationHistory;
  constants: {
    triggersConst: IAutomationsTriggerConfigConstants[];
    actionsConst: IAutomationsActionConfigConstants[];
  };
}) => {
  const { triggers = [], actions = [] } = useWatch({ name: 'detail' }) || {};

  const { beforeTitleContent } = useBeforeTitleContent(history);

  return (
    <div className="h-full">
      <ReactFlow
        nodes={generateNodes(triggers, actions, {
          constants,
          beforeTitleContent,
        })}
        edges={generateEdges(triggers, actions)}
        fitView
        fitViewOptions={{ padding: 4, minZoom: 0.8 }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={true}
        elementsSelectable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
      >
        <Background gap={16} size={3} />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  );
};
