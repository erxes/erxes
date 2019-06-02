import { BrandAdd, TargetCount } from 'modules/engage/types';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import Common from './Common';
import { BrandForm } from './forms';

type Props = {
  brandIds: string[];
  brands: IBrand[];
  messageType: string;
  targetCount: TargetCount;
  customersCount: (ids: string[]) => number;
  onChange: (name: string, value: string[]) => void;
  brandAdd: BrandAdd;
  renderContent: (
    {
      actionSelector,
      selectedComponent,
      customerCounts
    }: {
      actionSelector: React.ReactNode;
      selectedComponent: React.ReactNode;
      customerCounts: React.ReactNode;
    }
  ) => React.ReactNode;
};

const BrandStep = (props: Props) => {
  const {
    brandAdd,
    onChange,
    brands,
    brandIds,
    targetCount,
    customersCount,
    messageType,
    renderContent
  } = props;

  return (
    <Common<IBrand, BrandAdd>
      name="brandIds"
      label="Create a brand"
      targetIds={brandIds}
      messageType={messageType}
      targets={brands}
      targetCount={targetCount}
      customersCount={customersCount}
      onChange={onChange}
      onSubmit={brandAdd}
      Form={BrandForm}
      content={renderContent}
    />
  );
};

export default BrandStep;
