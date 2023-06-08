import { IBoard } from '@erxes/ui-cards/src/boards/types';
import MainActionBar from '@erxes/ui-cards/src/boards/components/MainActionBar';
import React from 'react';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import { __ } from 'coreui/utils';
import { getBoardViewType } from '@erxes/ui-cards/src/boards/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import options from '@erxes/ui-cards/src/purchases/options';

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

const PurchaseMainActionBar = (props: Props) => {
  const { queryParams, onSelect } = props;

  const viewType = getBoardViewType();

  const extraFilter = (
    <>
      {isEnabled('products') && (
        <SelectProducts
          label={__('Filter by products')}
          name="productIds"
          queryParams={queryParams}
          onSelect={onSelect}
        />
      )}
      {isEnabled('contacts') && (
        <>
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
      )}
    </>
  );

  const extendedProps = {
    ...props,
    options,
    extraFilter,
    type: 'm',
    link: `/purchase/${viewType}`
  };
  return <MainActionBar viewType={viewType} {...extendedProps} />;
};

export default PurchaseMainActionBar;
