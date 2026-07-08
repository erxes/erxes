import { useLazyQuery, useMutation } from '@apollo/client';
import { LOGS_REVERT_PROCESS } from '@/logs/graphql/revertMutations';
import { LOGS_REVERT_PREVIEW } from '@/logs/graphql/revertQueries';

export interface IRevertField {
  field: string;
  revertValue?: unknown;
  currentValue?: unknown;
}

export interface IRevertConflict {
  contentType: string;
  docId: string;
  mongooseName: string;
  fields: IRevertField[];
}

export interface IRevertApplied {
  contentType: string;
  docId: string;
  kind: string;
}

export interface IRevertUnrevertable {
  contentType?: string;
  docId?: string;
  action: string;
  reason: string;
}

export interface IRevertResult {
  processId: string;
  dryRun: boolean;
  alreadyReverted: boolean;
  reverted: IRevertApplied[];
  conflicts: IRevertConflict[];
  unrevertable: IRevertUnrevertable[];
}

export interface IFieldResolution {
  field: string;
  mode: 'restore' | 'keep' | 'custom';
  value?: unknown;
}

export interface IDocResolution {
  contentType: string;
  docId: string;
  fields: IFieldResolution[];
}

/** Hook exposing `preview`/`apply` for the point-in-time revert. */
export const useRevertProcess = () => {
  // Preview is a read-only QUERY (not audit-logged), so the panel's silent
  // on-open dry-run never spawns a phantom `logsRevertProcess` log. Only `apply`
  // uses the mutation, which is correctly recorded as a real change.
  const [runPreview, { loading: previewLoading }] = useLazyQuery(
    LOGS_REVERT_PREVIEW,
    { fetchPolicy: 'network-only' },
  );
  const [runApply, { loading: applyLoading }] = useMutation(
    LOGS_REVERT_PROCESS,
  );

  /** Preview the plan without writing anything (read-only, un-logged). */
  const preview = async (processId: string): Promise<IRevertResult> => {
    // useLazyQuery resolves (not rejects) with `.error` on failure; re-throw so
    // callers' try/catch and error toasts keep the mutation's throw semantics.
    const { data, error } = await runPreview({ variables: { processId } });
    if (error) {
      throw error;
    }
    return data.logsRevertPreview as IRevertResult;
  };

  /** Apply the revert, optionally with per-field merge resolutions. */
  const apply = async (
    processId: string,
    resolutions?: IDocResolution[],
  ): Promise<IRevertResult> => {
    const { data } = await runApply({
      variables: { processId, dryRun: false, resolutions },
    });
    return data.logsRevertProcess as IRevertResult;
  };

  return { preview, apply, loading: previewLoading || applyLoading };
};
