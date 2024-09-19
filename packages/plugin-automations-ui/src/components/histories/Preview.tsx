import React from 'react';
import ReactFlow, {
  Background,
  ConnectionMode,
  Controls,
  EdgeTypes
} from 'reactflow';
import { IAutomation, IAutomationHistory } from '../../types';
import PrimaryEdge from '../editor/edges/PrimaryEgde';
import CustomNode from '../editor/nodes/PrimaryNode';
import ScratchNode from '../editor/nodes/ScratchNode';
import { generateEdges, generateNodes } from '../editor/utils';
import { renderDynamicComponent } from '../../utils';
import { generateActionResult } from './Row';
import Popover from '@erxes/ui/src/components/Popover';
import { NodeStatusTrigger } from '../editor/styles';
import Icon from '@erxes/ui/src/components/Icon';
import { PopoverContent } from '@erxes/ui/src/components/filterableList/styles';
import { PopoverHeader } from '@erxes/ui/src/styles/main';
import dayjs from 'dayjs';

type Props = {
  automation: IAutomation;
  constants: any;
  history: IAutomationHistory;
};

const nodeTypes = {
  primary: CustomNode,
  scratch: ScratchNode
};

const edgeTypes: EdgeTypes = {
  primary: PrimaryEdge
};

const renderPopover = (Component, info?) => {
  return (
    <Popover
      trigger={
        <NodeStatusTrigger error={info?.error ? info?.error : undefined}>
          <Icon icon={info?.error ? 'times' : 'check'} />
        </NodeStatusTrigger>
      }
    >
      <PopoverContent style={{ width: 250, padding: '10px' }}>
        <PopoverHeader>{dayjs(info.createdAt).format('lll')}</PopoverHeader>
        {Component}
      </PopoverContent>
    </Popover>
  );
};

export default function Preview({ automation, constants, history }: Props) {
  const { triggers, actions } = automation;

  const additionalContent = (id, type) => {
    if (type === 'trigger' && history.triggerId === id) {
      const Component = renderDynamicComponent(
        {
          target: history.target,
          triggerType: history.triggerType,
          componentType: 'historyName'
        },
        history.triggerType
      );

      return renderPopover(Component, { createdAt: history.createdAt });
    }

    if (type === 'action') {
      const action = (history?.actions || []).find(
        (action) => action.actionId === id
      );

      if (action) {
        return renderPopover(generateActionResult(action), {
          error: action.result?.error,
          createdAt: action.createdAt
        });
      }
    }

    return null;
  };

  return (
    <div style={{ height: 800 }}>
      <ReactFlow
        nodes={generateNodes(
          { triggers: automation.triggers, actions: automation.actions },
          { constants, additionalContent }
        )}
        edges={generateEdges({ triggers, actions })}
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
}
