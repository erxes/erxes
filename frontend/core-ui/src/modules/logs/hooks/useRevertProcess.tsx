import { useMutation } from '@apollo/client';
import { LOGS_REVERT_PROCESS } from '@/logs/graphql/revertMutations';

export interface IRevertField {
  field: string;
  revertValue?: any;
  currentValue?: any;
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
  value?: any;
}

export interface IDocResolution {
  contentType: string;
  docId: string;
  fields: IFieldResolution[];
}

export const useRevertProcess = () => {
  const [run, { loading }] = useMutation(LOGS_REVERT_PROCESS);

  const call = async (variables: {
    processId: string;
    dryRun?: boolean;
    resolutions?: IDocResolution[];
  }): Promise<IRevertResult> => {
    const { data } = await run({ variables });
    return data.logsRevertProcess as IRevertResult;
  };

  /** Preview the plan without writing anything. */
  const preview = (processId: string) => call({ processId, dryRun: true });

  /** Apply the revert, optionally with per-field merge resolutions. */
  const apply = (processId: string, resolutions?: IDocResolution[]) =>
    call({ processId, dryRun: false, resolutions });

  return { preview, apply, loading };
};
