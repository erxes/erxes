import { CoordinateExtent, Position } from 'reactflow';
import { AutomationConstants, IAutomation, IAutomationNote } from '../../types';
import { IAction } from '@erxes/ui-automations/src/types';

export type NodeType = {
  id: any;
  data: any;
  position: {
    x: number;
    y: number;
  };
  isConnectable: boolean;
  type: string;
  style: any;
  extent?: 'parent' | CoordinateExtent;
};

export type NodeProps = {
  id: string;
  data: {
    automation: IAutomation;
    automationNotes?: IAutomationNote[];
    type: string;
    nodeType: string;
    actionType: string;
    triggerType?: string;
    icon: string;
    label: string;
    description: string;
    config: any;
    toggleDrawer: ({
      type,
      awaitingNodeId
    }: {
      type: string;
      awaitingNodeId?: string;
    }) => void;
    onDoubleClick: (type: string, id: string) => void;
    removeItem: (type: string, id: string) => void;
    constants: AutomationConstants;
    forceToolbarVisible: boolean;
    toolbarPosition: Position;
    additionalContent?: (id: string, type: string) => React.ReactNode;
    addWorkFlowAction: (workflowId: string, actions: IAction[]) => void;
    removeWorkFlowAction?: (workflowId: string) => void;
  };
  selected: boolean;
  xPos: number;
  yPos: number;
};
