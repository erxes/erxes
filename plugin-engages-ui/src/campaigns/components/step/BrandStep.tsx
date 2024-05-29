import Icon from '@erxes/ui/src/components/Icon';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { Counts } from '@erxes/ui/src/types';
import React from 'react';
import Common from './Common';
import BrandForm from './forms/BrandForm';
import { IBrand } from '@erxes/ui/src/brands/types';

type Props = {
  brandIds: string[];
  brands: IBrand[];
  messageType: string;
  targetCount: Counts;
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
  loadingCount: boolean;
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
    renderContent,
    loadingCount
  } = props;

  const icons: React.ReactNode[] = [];

  brands.forEach(brand => {
    icons.push(<Icon icon="medal-1" style={{ color: '#3B85F4' }} />);
  });

  return (
    <Common<any, {}>
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
      loadingCount={loadingCount}
    />
  );
};

export default BrandStep;
