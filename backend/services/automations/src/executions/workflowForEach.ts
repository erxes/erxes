export type TWorkflowForEachFailure = {
  index: number;
  childExecutionId: string;
  error?: string;
};

// Kept on the waiting workflow exec action while the items run one by one
export type TWorkflowForEachState = {
  items: unknown[];
  itemInput: string;
  onItemError: 'continue' | 'stop';
  // Inputs shared by every item, resolved once when the node was entered
  inputs: Record<string, unknown>;
  index: number;
  currentChildId: string;
  succeeded: number;
  failed: TWorkflowForEachFailure[];
};

// What the node reports once no item is left to run; the list itself is
// dropped so history does not carry it twice.
export type TWorkflowForEachSummary = {
  total: number;
  succeeded: number;
  failed: TWorkflowForEachFailure[];
  stopped?: boolean;
};

export type TWorkflowForEachStep =
  | { kind: 'nextItem'; state: TWorkflowForEachState }
  | { kind: 'done'; summary: TWorkflowForEachSummary }
  | { kind: 'stopped'; summary: TWorkflowForEachSummary };

export const forEachItemSuffix = (index: number, total: number) =>
  ` (item ${index + 1} of ${total})`;

// Records the current item's result and decides what happens next
export const advanceForEach = (
  state: TWorkflowForEachState,
  status: 'complete' | 'error',
  errorMessage?: string,
): TWorkflowForEachStep => {
  const succeeded = state.succeeded + (status === 'complete' ? 1 : 0);
  const failed =
    status === 'complete'
      ? state.failed
      : [
          ...state.failed,
          {
            index: state.index,
            childExecutionId: state.currentChildId,
            error: errorMessage,
          },
        ];
  const summary = { total: state.items.length, succeeded, failed };

  if (status === 'error' && state.onItemError === 'stop') {
    return { kind: 'stopped', summary: { ...summary, stopped: true } };
  }

  if (state.index + 1 < state.items.length) {
    return {
      kind: 'nextItem',
      state: { ...state, index: state.index + 1, succeeded, failed },
    };
  }

  return { kind: 'done', summary };
};
