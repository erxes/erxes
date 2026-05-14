import { PageHeader } from 'ui-modules';
import { LoyaltyScoreAddSheet } from './LoyaltyScoreAddSheet';

export const LoyaltyScoreAddHeader = () => {
  return (
    <PageHeader>
      <PageHeader.End>
        <LoyaltyScoreAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
