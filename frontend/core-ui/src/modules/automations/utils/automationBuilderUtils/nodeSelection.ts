export type TNodeSelection = {
  actionIds: string[];
  triggerIds: string[];
  workflowIds: string[];
};

export const EMPTY_NODE_SELECTION: TNodeSelection = {
  actionIds: [],
  triggerIds: [],
  workflowIds: [],
};

export const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count > 1 ? 's' : ''}`;

export const describeNodeSelection = ({
  actionIds,
  triggerIds,
  workflowIds,
}: TNodeSelection) =>
  [
    triggerIds.length && pluralize(triggerIds.length, 'trigger'),
    actionIds.length && pluralize(actionIds.length, 'action'),
    workflowIds.length && pluralize(workflowIds.length, 'workflow'),
  ]
    .filter(Boolean)
    .join(', ');
