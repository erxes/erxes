import { gql } from '@apollo/client';

/**
 * Read-only preview of a point-in-time revert. Returns the same shape as the
 * `logsRevertProcess` mutation (what would be restored, conflicts, unrevertable,
 * alreadyReverted) WITHOUT mutating or being audit-logged — so the log-detail
 * panel can silently dry-run it on open without spawning a phantom
 * `logsRevertProcess` log entry. The apply step still uses the mutation.
 */
export const LOGS_REVERT_PREVIEW = gql`
  query LogsRevertPreview($processId: String!) {
    logsRevertPreview(processId: $processId) {
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
