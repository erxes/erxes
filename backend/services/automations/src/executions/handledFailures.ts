import { IAutomationExecutionDocument } from 'erxes-api-shared/core-modules';

/**
 * A run that carries on past a failed action — an ignored deferred action or
 * an error branch — still records which action failed, so a finished run never
 * reads as a clean one.
 */
export const recordHandledFailure = (
  execution: IAutomationExecutionDocument,
  actionId: string,
) => {
  execution.handledFailureActionIds = Array.from(
    new Set([...(execution.handledFailureActionIds || []), actionId]),
  );
};
