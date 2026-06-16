import { IContext } from '~/connectionResolvers';
import { revertByProcessId } from '../../revert/revertByProcessId';
import { RevertDocResolution } from '../../revert/types';

export interface LogsRevertProcessArgs {
  processId: string;
  dryRun?: boolean;
  force?: boolean;
  skipConflicts?: boolean;
  resolutions?: RevertDocResolution[];
}

export const logMutations = {
  /**
   * Point-in-time revert of every change carrying `processId`.
   *
   * Per-entity authorization (each distinct contentType's gating permission, or
   * admin/owner) is enforced inside the orchestrator BEFORE any write — a caller
   * lacking permission for any entity in the process gets the whole revert
   * refused. dryRun returns a preview (wouldRevert + field-level conflicts +
   * unrevertable) without mutating; conflicts can then be resolved via the merge
   * style `resolutions` input.
   */
  async logsRevertProcess(
    _root: unknown,
    args: LogsRevertProcessArgs,
    context: IContext,
  ) {
    return await revertByProcessId(context, {
      processId: args.processId,
      dryRun: args.dryRun,
      force: args.force,
      skipConflicts: args.skipConflicts,
      resolutions: args.resolutions,
    });
  },
};
