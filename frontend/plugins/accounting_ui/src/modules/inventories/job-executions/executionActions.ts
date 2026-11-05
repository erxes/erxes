import { JobExecution } from './types';

export type ExecutionAction = 'post' | 'undo' | 'remove';
export type ExecutionActionRecord = Pick<
  JobExecution,
  '_id' | 'status' | 'parentId'
>;

export const canRunExecutionAction = (
  action: ExecutionAction,
  execution: ExecutionActionRecord,
  canManage: boolean,
  canRemove: boolean,
): boolean => {
  if (action === 'post')
    return canManage && execution.status === 'draft' && !execution.parentId;
  if (action === 'undo')
    return canManage && ['posted', 'error'].includes(execution.status);
  return (
    canRemove &&
    ((execution.status === 'draft' && !execution.parentId) ||
      (canManage && ['posted', 'error'].includes(execution.status)))
  );
};

export const runExecutionAction = async (
  action: ExecutionAction,
  execution: ExecutionActionRecord,
  write: (action: ExecutionAction, id: string) => Promise<unknown>,
): Promise<void> => {
  if (action === 'remove' && ['posted', 'error'].includes(execution.status)) {
    await write('undo', execution._id);
  }
  await write(action, execution._id);
};
