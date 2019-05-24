import { TargetCount } from 'modules/engage/types';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import { BrandForm } from '../forms';
import Common from './Common';

type Props = {
  brandIds: string[];
  brands: IBrand[];
  messageType: string;
  targetCount: TargetCount;
  customersCount: (ids: string[]) => number;
  onChange: (
    name: 'brandIds' | 'tagIds' | 'segmentIds',
    value: string[]
  ) => void;
  brandAdd: (params: { doc: { name: string; description: string } }) => void;
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
    <Common
      name="brandIds"
      label="Create a brand"
      targetIds={brandIds}
      messageType={messageType}
      targets={brands}
      targetCount={targetCount}
      customersCount={customersCount}
      onChange={onChange}
      save={brandAdd}
      Form={BrandForm}
      content={renderContent}
    />
  );
};

export default BrandStep;
