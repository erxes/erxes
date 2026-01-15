import { PageContainer } from 'erxes-ui';
import { LoyaltyAssignmentEditSheet } from '~/modules/loyalties/settings/assignment/assignment-detail/components/LoyaltyAssignmentEditSheet';
import { useQueryState } from 'erxes-ui';
import { AssignmentRecordTable } from '~/modules/loyalties/settings/assignment/components/AssignmentRecordTable';

export const LoyaltyAssignmentPage = () => {
  const [editAssignmentId] = useQueryState<string>('editAssignmentId');

  return (
    <PageContainer>
      <AssignmentRecordTable />
      {editAssignmentId && (
        <LoyaltyAssignmentEditSheet assignmentId={editAssignmentId} />
      )}
    </PageContainer>
  );
};
