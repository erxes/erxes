import { PageHeader } from 'ui-modules';
import { LoyaltySCoreAddSheet } from './AddLoyaltyScoreForm';

export const LoyaltyScoreAddHeader = () => {
  return (
    <PageHeader>
      <PageHeader.End>
        <LoyaltySCoreAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
