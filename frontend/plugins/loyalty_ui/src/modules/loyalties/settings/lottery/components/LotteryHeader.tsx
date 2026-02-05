import { PageHeader } from 'ui-modules';
import { LotteryAddSheet } from './LotteryAddSheet';

export const LotteryHeader = () => {
  return (
    <PageHeader>
      <PageHeader.End>
        <LotteryAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
