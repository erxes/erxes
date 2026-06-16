import { gql } from '@apollo/client';

/**
 * Point-in-time revert of every change made under a log entry's processId.
 * dryRun previews the plan (what would be restored, conflicts, unrevertable);
 * a second call with dryRun:false (and optional field-level resolutions) applies it.
 */
export const LOGS_REVERT_PROCESS = gql`
  mutation LogsRevertProcess(
    $processId: String!
    $dryRun: Boolean
    $force: Boolean
    $skipConflicts: Boolean
    $resolutions: [LogRevertDocResolutionInput!]
  ) {
    logsRevertProcess(
      processId: $processId
      dryRun: $dryRun
      force: $force
      skipConflicts: $skipConflicts
      resolutions: $resolutions
    ) {
      processId
      dryRun
      alreadyReverted
      reverted {
        contentType
        docId
        kind
      }
      conflicts {
        contentType
        docId
        mongooseName
        fields {
          field
          revertValue
          currentValue
        }
      }
      unrevertable {
        contentType
        docId
        action
        reason
      }
    }
  }
`;
