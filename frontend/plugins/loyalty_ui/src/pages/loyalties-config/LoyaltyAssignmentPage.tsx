import { PageContainer, useQueryState } from 'erxes-ui';
import { LoyaltyAssignmentEditSheet } from '~/modules/loyalties/settings/assignment/assignment-detail/components/LoyaltyAssignmentEditSheet';
import { AssignmentRecordTable } from '~/modules/loyalties/settings/assignment/components/AssignmentRecordTable';
import { LoyaltyLayout } from '~/modules/loyalties/settings/components/LoyaltyLayout';

export const LoyaltyAssignmentPage = () => {
  const [editAssignmentId] = useQueryState<string>('editAssignmentId');

  return (
    <LoyaltyLayout>
      <PageContainer>
        <AssignmentRecordTable />
        {editAssignmentId && (
          <LoyaltyAssignmentEditSheet assignmentId={editAssignmentId} />
        )}
      </PageContainer>
    </LoyaltyLayout>
  );
};
