import MainActionBar from 'modules/boards/components/MainActionBar';
import { ButtonGroup } from 'modules/boards/styles/header';
import { IBoard, IPipeline } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import SelectCompanies from 'modules/companies/containers/SelectCompanies';
import SelectCustomers from 'modules/customers/containers/common/SelectCustomers';
import React from 'react';
import { Link } from 'react-router-dom';
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

const TaskMainActionBar = (props: Props) => {
  const { queryParams, onSelect } = props;

  // get selected type from URL
  const viewType = window.location.href.includes('calendar')
    ? 'calendar'
    : 'board';

  const viewChooser = () => {
    const onFilterClick = (type: string) => {
      const { currentBoard, currentPipeline } = props;

      if (currentBoard && currentPipeline) {
        return `/task/${type}?id=${currentBoard._id}&pipelineId=${currentPipeline._id}`;
      }

      return `/task/${type}`;
    };

    const boardLink = onFilterClick('board');
    const calendarLink = onFilterClick('calendar');

    return (
      <ButtonGroup>
        <Tip text={__('Board')} placement="bottom">
          <Link to={boardLink} className={viewType === 'board' ? 'active' : ''}>
            <Icon icon="window-section" />
          </Link>
        </Tip>
        <Tip text={__('Calendar')} placement="bottom">
          <Link
            to={calendarLink}
            className={viewType === 'calendar' ? 'active' : ''}
          >
            <Icon icon="calender" />
          </Link>
        </Tip>
      </ButtonGroup>
    );
  };

  const extraFilter = (
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
  );

  const extendedProps = {
    ...props,
    options,
    extraFilter,
    link: `/task/${viewType}`,
    rightContent: viewChooser
  };

  return <MainActionBar {...extendedProps} />;
};

export default TaskMainActionBar;
