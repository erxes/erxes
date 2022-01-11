import MainActionBar from '@erxes/ui-cards/src/boards/components/MainActionBar';
import { IBoard } from '@erxes/ui-cards/src/boards/types';
import { __ } from '@erxes/ui/src/utils';
import SelectCompanies from '@erxes/ui/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui/src/customers/containers/SelectCustomers';
import SelectProducts from '@erxes/ui-cards/src/products/containers/SelectProducts';
import React from 'react';
import options from '../options';
import { getBoardViewType } from '@erxes/ui-cards/src/boards/utils';

type Props = {
  onSearch: (search: string) => void;
  onSelect: (values: string[] | string, name: string) => void;
  onDateFilterSelect: (name: string, value: string) => void;
  onClear: (name: string, values) => void;
  isFiltered: () => boolean;
  clearFilter: () => void;
  boards: IBoard[];
  middleContent?: () => React.ReactNode;
  history: any;
  queryParams: any;
};

const DealMainActionBar = (props: Props) => {
  const { queryParams, onSelect } = props;

  const viewType = getBoardViewType();

  const extraFilter = (
    <>
      <SelectProducts
        label={__('Filter by products')}
        name="productIds"
        queryParams={queryParams}
        onSelect={onSelect}
      />
      <SelectCompanies
        label={__('Filter by companies')}
        name="companyIds"
        queryParams={queryParams}
        onSelect={onSelect}
      />
      <SelectCustomers
        label="Filter by customers"
        name="customerIds"
        queryParams={queryParams}
        onSelect={onSelect}
      />
    </>
  );

  const extendedProps = {
    ...props,
    options,
    extraFilter,
    link: `/deal/${viewType}`
  };

  return <MainActionBar viewType={viewType} {...extendedProps} />;
};

export default DealMainActionBar;
