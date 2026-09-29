import ActionNode from '@/automations/components/builder/nodes/components/ActionNode';
import { NoteNode } from '@/automations/components/builder/nodes/components/NoteNode';
import { NOTE_NODE_TYPE } from '@/automations/constants/notes';
import { PlaceHolderNode } from '@/automations/components/builder/nodes/components/PlaceHolderNode';
import TriggerNode from '@/automations/components/builder/nodes/components/TriggerNode';
import { WorkflowInputNode } from '@/automations/components/builder/nodes/components/WorkflowInputNode';
import WorkflowNode from '@/automations/components/builder/nodes/components/WorkflowNode';

export const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  workflow: WorkflowNode,
  workflowInput: WorkflowInputNode,
  scratch: PlaceHolderNode,
  [NOTE_NODE_TYPE]: NoteNode,
};
