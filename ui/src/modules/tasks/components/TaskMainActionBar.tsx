import MainActionBar from 'modules/boards/components/MainActionBar';
import { ButtonGroup } from 'modules/boards/styles/header';
import { IBoard, IPipeline } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import { __ } from 'modules/common/utils';
import SelectCompanies from 'modules/companies/containers/SelectCompanies';
import SelectCustomers from 'modules/customers/containers/common/SelectCustomers';
import React from 'react';
import { Link } from 'react-router-dom';
import options from '../options';
import { Dropdown } from 'react-bootstrap';
import Button from 'modules/common/components/Button';

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
  let viewType = 'board';

  if (window.location.href.includes('calendar')) {
    viewType = 'calendar';
  }

  if (window.location.href.includes('activity')) {
    viewType = 'activity';
  }

  if (window.location.href.includes('list')) {
    viewType = 'list';
  }

  const viewChooser = () => {
    const onFilterClick = (type: string) => {
      const { currentBoard, currentPipeline } = props;

      if (currentBoard && currentPipeline) {
        return `/task/${type}?id=${currentBoard._id}&pipelineId=${currentPipeline._id}`;
      }

      return `/task/${type}`;
    };

    const boardLink = onFilterClick('board');
    const listLink = onFilterClick('list');
    const calendarLink = onFilterClick('calendar');
    const activityLink = onFilterClick('activity');

    return (
      <ButtonGroup>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-taskaction">
            <Button btnStyle="primary" icon="list-ui-alt">
              {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li key="board">
              <Link
                to={boardLink}
                className={viewType === 'board' ? 'active' : ''}
              >
                {__('Board')}
              </Link>
            </li>
            <li key="calendar">
              <Link
                to={calendarLink}
                className={viewType === 'calendar' ? 'active' : ''}
              >
                {__('Calendar')}
              </Link>
            </li>
            <li key="activity">
              <Link
                to={activityLink}
                className={viewType === 'activity' ? 'active' : ''}
              >
                {__('Activity')}
              </Link>
            </li>
            <li key="list">
              <Link
                to={listLink}
                className={viewType === 'list' ? 'active' : ''}
              >
                {__('List')}
              </Link>
            </li>
          </Dropdown.Menu>
        </Dropdown>
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

  return <MainActionBar viewType={viewType} {...extendedProps} />;
};

export default TaskMainActionBar;
