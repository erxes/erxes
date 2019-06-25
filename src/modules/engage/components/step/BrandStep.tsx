import { IButtonMutateProps } from 'modules/common/types';
import { TargetCount } from 'modules/engage/types';
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
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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
    renderButton,
    onChange,
    brands,
    brandIds,
    targetCount,
    customersCount,
    messageType,
    renderContent
  } = props;

  return (
    <Common<IBrand, {}>
      name="brandIds"
      label="Create a brand"
      targetIds={brandIds}
      messageType={messageType}
      targets={brands}
      targetCount={targetCount}
      customersCount={customersCount}
      onChange={onChange}
      renderButton={renderButton}
      Form={BrandForm}
      content={renderContent}
    />
  );
};

export default BrandStep;
