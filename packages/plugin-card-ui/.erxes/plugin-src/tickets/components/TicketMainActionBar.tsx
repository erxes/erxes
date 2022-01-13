import MainActionBar from '@erxes/ui-cards/src/boards/components/MainActionBar';
import { IBoard } from '@erxes/ui-cards/src/boards/types';
import { IOption } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import SelectCompanies from '@erxes/ui/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui/src/customers/containers/SelectCustomers';
import { INTEGRATION_KINDS } from '@erxes/ui-settings/src/integrations/constants';
import React from 'react';
import Select from 'react-select-plus';
import options from '@erxes/ui-cards/src/tickets/options';
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

const TicketMainActionBar = (props: Props) => {
  const { queryParams, onSelect } = props;

  const viewType = getBoardViewType();

  const sourceValues = INTEGRATION_KINDS.ALL.map(kind => ({
    label: kind.text,
    value: kind.value
  }));

  sourceValues.push({
    label: 'Other',
    value: 'other'
  });

  const sources = queryParams ? queryParams.source : [];
  const onSourceSelect = (ops: IOption[]) =>
    onSelect(
      ops.map(option => option.value),
      'source'
    );

  const extraFilter = (
    <>
      <Select
        placeholder={__('Choose a source')}
        value={sources}
        options={sourceValues}
        name="source"
        onChange={onSourceSelect}
        multi={true}
        loadingPlaceholder={__('Loading...')}
      />

      <SelectCompanies
        label="Choose companies"
        name="companyIds"
        queryParams={queryParams}
        onSelect={onSelect}
      />

      <SelectCustomers
        label="Choose customers"
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
    link: `/ticket/${viewType}`
  };

  return <MainActionBar viewType={viewType} {...extendedProps} />;
};

export default TicketMainActionBar;
