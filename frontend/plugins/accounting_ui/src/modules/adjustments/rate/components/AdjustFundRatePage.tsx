import { PageHeader } from 'ui-modules';
import { AddAdjustFundRate } from './AdjustFundRateForm';
import { AdjustFundRateTable } from './AdjustFundRateTable';

export const AdjustFundRatePage = () => {
  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Fund Rate Adjustment">
        <AddAdjustFundRate />
      </PageHeader>
      <AdjustFundRateTable />
    </div>
  );
};
