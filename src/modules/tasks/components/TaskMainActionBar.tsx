import MainActionBar from 'modules/boards/components/MainActionBar';
import { PRIORITIES } from 'modules/boards/constants';
import { IBoard, IPipeline } from 'modules/boards/types';
import { IOption } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import SelectCompanies from 'modules/companies/containers/SelectCompanies';
import SelectCustomers from 'modules/customers/containers/common/SelectCustomers';
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

const TaskMainActionBar = (props: Props) => {
  const { queryParams, onSelect } = props;

  const priorityValues = PRIORITIES.map(p => ({ label: p, value: p }));

  const priorities = queryParams ? queryParams.priority : [];

  const onPrioritySelect = (ops: IOption[]) =>
    onSelect(ops.map(option => option.value), 'priority');

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
    link: '/task/board'
  };

  return <MainActionBar {...extendedProps} />;
};

export default TaskMainActionBar;
