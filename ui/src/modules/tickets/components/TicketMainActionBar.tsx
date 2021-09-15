import MainActionBar from 'modules/boards/components/MainActionBar';
import { ButtonGroup } from 'modules/boards/styles/header';
import { IBoard, IPipeline } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import { IOption } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import SelectCompanies from 'modules/companies/containers/SelectCompanies';
import SelectCustomers from 'modules/customers/containers/common/SelectCustomers';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
import React from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select-plus';
import options from '../options';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import Button from 'modules/common/components/Button';
import { GroupByContent } from 'modules/boards/styles/common';

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

  // get selected type from URL
  let viewType = 'board';

  if (window.location.href.includes('calendar')) {
    viewType = 'calendar';
  } else if (window.location.href.includes('list')) {
    viewType = 'list';
  }

  const viewChooser = () => {
    const onFilterClick = (type: string) => {
      const { currentBoard, currentPipeline } = props;

      if (currentBoard && currentPipeline) {
        return `/ticket/${type}?id=${currentBoard._id}&pipelineId=${currentPipeline._id}`;
      }

      return `/ticket/${type}`;
    };

    const boardLink = onFilterClick('board');
    const listLink = onFilterClick('list');
    const calendarLink = onFilterClick('calendar');

    return (
      <ButtonGroup>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-taskaction">
            <Button>
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
            <li key="list">
              <Link
                to={listLink}
                className={viewType === 'list' ? 'active' : ''}
              >
                {__('List')}
              </Link>
            </li>
            <li key="chart">
              <Link
                to={boardLink}
                className={viewType === 'board' ? 'active' : ''}
              >
                {__('Chart')}
              </Link>
            </li>
            <li key="activity">
              <Link
                to={boardLink}
                className={viewType === 'board' ? 'active' : ''}
              >
                {__('Activity')}
              </Link>
            </li>
            <li>
              <a
                href="#verifyPhone"
                // onClick={this.verifyCustomers.bind(this, 'phone')}
              >
                {__('Gantt timeline')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
    );
  };

  const renderGroupBy = () => {
    if (viewType === 'list') {
      const onFilterType = (type: string) => {
        const { currentBoard, currentPipeline } = props;

        if (currentBoard && currentPipeline) {
          return `/ticket/list?id=${currentBoard._id}&pipelineId=${currentPipeline._id}&groupBy=${type}`;
        }

        return `/ticket/${type}`;
      };

      const stageLink = onFilterType('stage');
      const labelLink = onFilterType('label');
      const priorityLink = onFilterType('priority');
      const assignLink = onFilterType('assign');
      const dueDateLink = onFilterType('dueDate');

      const typeName = queryParams.groupBy;

      return (
        <GroupByContent>
          <Icon icon="list-2" />
          <span>{__('Group by:')}</span>
          <Dropdown>
            <Dropdown.Toggle as={DropdownToggle} id="dropdown-groupby">
              <Button btnStyle="primary" size="small">
                {typeName
                  ? typeName.charAt(0).toUpperCase() + typeName.slice(1)
                  : __('Stage')}
                <Icon icon="angle-down" />
              </Button>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <li>
                <Link to={stageLink}>{__('Stage')}</Link>
              </li>
              <li>
                <Link to={labelLink}>{__('Label')}</Link>
              </li>
              <li>
                <Link to={priorityLink}>{__('Priority')}</Link>
              </li>
              <li>
                <Link to={assignLink}>{__('Assignee')}</Link>
              </li>
              <li>
                <Link to={dueDateLink}>{__('Due Date')}</Link>
              </li>
            </Dropdown.Menu>
          </Dropdown>
        </GroupByContent>
      );
    }
    return null;
  };

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
    groupContent: renderGroupBy,
    link: `/ticket/${viewType}`,
    rightContent: viewChooser
  };

  return <MainActionBar {...extendedProps} />;
};

export default TicketMainActionBar;
