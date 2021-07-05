import MainActionBar from 'modules/boards/components/MainActionBar';
import { ButtonGroup } from 'modules/boards/styles/header';
import { IBoard, IPipeline } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { IOption } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import SelectCompanies from 'modules/companies/containers/SelectCompanies';
import SelectCustomers from 'modules/customers/containers/common/SelectCustomers';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
import React from 'react';
import { Link } from 'react-router-dom';
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

  // get selected type from URL
  const viewType = window.location.href.includes('calendar')
    ? 'calendar'
    : 'board';

  const viewChooser = () => {
    const onFilterClick = (type: string) => {
      const { currentBoard, currentPipeline } = props;

      if (currentBoard && currentPipeline) {
        return `/inbox/ticket/${type}?id=${currentBoard._id}&pipelineId=${currentPipeline._id}`;
      }

      return `/inbox/ticket/${type}`;
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
    link: `/inbox/ticket/${viewType}`,
    rightContent: viewChooser
  };

  return <MainActionBar {...extendedProps} />;
};

export default TicketMainActionBar;
