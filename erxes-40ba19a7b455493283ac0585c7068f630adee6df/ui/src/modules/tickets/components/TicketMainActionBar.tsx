import MainActionBar from 'modules/boards/components/MainActionBar';
import { IBoard, IPipeline } from 'modules/boards/types';
import { IOption } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import SelectCompanies from 'modules/companies/containers/SelectCompanies';
import SelectCustomers from 'modules/customers/containers/common/SelectCustomers';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
import React from 'react';
import Select from 'react-select-plus';
import options from '../options';

type Props = {
  onSearch: (search: string) => void;
  onSelect: (values: string[] | string, name: string) => void;
  onDateFilterSelect: (name: string, value: string) => void;
  onClear: (name: string, values) => void;
  isFiltered: () => boolean;
  clearFilter: () => void;
  currentBoard?: IBoard;
  currentPipeline?: IPipeline;
  boards: IBoard[];
  middleContent?: () => React.ReactNode;
  history: any;
  queryParams: any;
  assignedUserIds?: string[];
  type: string;
};

const TicketMainActionBar = (props: Props) => {
  const { queryParams, onSelect } = props;

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
        placeholder="Choose a source"
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
    link: '/inbox/ticket/board'
  };

  return <MainActionBar {...extendedProps} />;
};

export default TicketMainActionBar;
