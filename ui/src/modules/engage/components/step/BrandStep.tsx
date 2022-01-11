import Icon from 'modules/common/components/Icon';
import { IButtonMutateProps } from 'modules/common/types';
import { TargetCount } from 'modules/engage/types';
import { IBrand } from 'modules/settings/brands/types';
import React from 'react';
import Common from './Common';
import BrandForm from './forms/BrandForm';

type Props = {
  brandIds: string[];
  brands: IBrand[];
  messageType: string;
  targetCount: TargetCount;
  customersCount: (ids: string[]) => number;
  onChange: (name: string, value: string[]) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  renderContent: ({
    actionSelector,
    selectedComponent,
    customerCounts
  }: {
    actionSelector: React.ReactNode;
    selectedComponent: React.ReactNode;
    customerCounts: React.ReactNode;
  }) => React.ReactNode;
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

  const icons: React.ReactNode[] = [];

  brands.forEach(brand => {
    icons.push(<Icon icon="medal-1" style={{ color: '#3B85F4' }} />);
  });

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
      icons={icons}
    />
  );
};

export default BrandStep;
