import { PageHeader } from 'ui-modules';
import { LoyaltyAssignmentAddSheet } from './AssignmentAddSheet';

export const LoyaltyAssignmentAddHeader = () => {
  return (
    <PageHeader>
      <PageHeader.End>
        <LoyaltyAssignmentAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
