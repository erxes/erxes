import { MainActionBar } from 'modules/boards/components';
import { ButtonGroup } from 'modules/boards/styles/header';
import { IBoard, IPipeline } from 'modules/boards/types';
import { Icon } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { SelectProducts } from 'modules/settings/productService/containers';
import React from 'react';
import { Link } from 'react-router-dom';

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

const DealMainActionBar = (props: Props) => {
  const { queryParams, onSelect } = props;

  // get selected type from URL
  const viewType = window.location.href.includes('calendar')
    ? 'calendar'
    : 'board';

  const viewChooser = () => {
    const onFilterClick = (type: string) => {
      const { currentBoard, currentPipeline } = props;

      if (currentBoard && currentPipeline) {
        return `/deal/${type}?id=${currentBoard._id}&pipelineId=${
          currentPipeline._id
        }`;
      }

      return `/deal/${type}`;
    };

    const boardLink = onFilterClick('board');
    const calendarLink = onFilterClick('calendar');

    return (
      <ButtonGroup>
        <Link to={boardLink} className={viewType === 'board' ? 'active' : ''}>
          <Icon icon="layout" />
          {__('Board')}
        </Link>
        <Link
          to={calendarLink}
          className={viewType === 'calendar' ? 'active' : ''}
        >
          <Icon icon="calendar" />
          {__('Calendar')}
        </Link>
      </ButtonGroup>
    );
  };

  const extraFilter = (
    <SelectProducts
      label="Choose products"
      name="productIds"
      queryParams={queryParams}
      onSelect={onSelect}
    />
  );

  const extendedProps = {
    ...props,
    extraFilter,
    link: `/deal/${viewType}`,
    rightContent: viewChooser
  };

  return <MainActionBar {...extendedProps} />;
};

export default DealMainActionBar;
