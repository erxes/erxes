import MainActionBar from 'modules/boards/components/MainActionBar';
import { PRIORITIES } from 'modules/boards/constants';
import { IBoard, IPipeline } from 'modules/boards/types';
import { IOption } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import SelectCompanies from 'modules/companies/containers/SelectCompanies';
import SelectCustomers from 'modules/customers/containers/common/SelectCustomers';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import React from 'react';
import Select from 'react-select-plus';

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

  const priorityValues = PRIORITIES.map(p => ({ label: p, value: p }));
  const sourceValues = KIND_CHOICES.ALL_LIST.map(key => ({
    label: key,
    value: key
  }));
  sourceValues.push({
    label: 'other',
    value: 'other'
  });

  const priorities = queryParams ? queryParams.priority : [];
  const sources = queryParams ? queryParams.source : [];

  const onPrioritySelect = (ops: IOption[]) =>
    onSelect(ops.map(option => option.value), 'priority');
  const onSourceSelect = (ops: IOption[]) =>
    onSelect(ops.map(option => option.value), 'source');

  const extraFilter = (
    <>
      <Select
        placeholder="Choose a priority"
        value={priorities}
        options={priorityValues}
        name="priority"
        onChange={onPrioritySelect}
        multi={true}
        loadingPlaceholder={__('Loading...')}
      />

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
    extraFilter,
    link: '/inbox/ticket/board'
  };

  return <MainActionBar {...extendedProps} />;
};

export default TicketMainActionBar;
