import { IAutomationExecAction } from 'erxes-api-shared/core-modules';

export const markExecActionStarted = (execAction: IAutomationExecAction) => {
  const now = new Date();

  execAction.createdAt = execAction.createdAt || (now as any);
  execAction.startedAt = now as any;

  return execAction;
};

export const finalizeExecAction = (
  execAction: IAutomationExecAction,
  status: 'success' | 'error' | 'waiting',
) => {
  const finishedAt = new Date();
  const startedAt = execAction.startedAt
    ? new Date(execAction.startedAt)
    : undefined;

  execAction.finishedAt = finishedAt as any;
  execAction.status = status;

  if (startedAt && !Number.isNaN(startedAt.getTime())) {
    execAction.durationMs = finishedAt.getTime() - startedAt.getTime();
  }

  return execAction;
};
