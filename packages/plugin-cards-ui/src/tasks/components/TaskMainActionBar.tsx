import { IBoard } from '@erxes/ui-cards/src/boards/types';
import MainActionBar from '@erxes/ui-cards/src/boards/components/MainActionBar';
import React from 'react';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import { __ } from 'coreui/utils';
import { getBoardViewType } from '@erxes/ui-cards/src/boards/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import options from '@erxes/ui-cards/src/tasks/options';

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

const TaskMainActionBar = (props: Props) => {
  const { queryParams, onSelect } = props;

  const extraFilter = (
    <>
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

  const viewType = getBoardViewType();

  const extendedProps = {
    ...props,
    options,
    extraFilter,
    link: `/task/${viewType}`
  };

  return <MainActionBar viewType={viewType} {...extendedProps} />;
};

export default TaskMainActionBar;
