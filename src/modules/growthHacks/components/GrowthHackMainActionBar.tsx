import MainActionBar from 'modules/boards/components/MainActionBar';
import { ButtonGroup } from 'modules/boards/styles/header';
import { IBoard, IPipeline } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import queryString from 'query-string';
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

const FILTER_PARAMS = [
  'search',
  'assignedUserIds',
  'nextWeek',
  'nextDay',
  'nextMonth',
  'noCloseDate',
  'overdue'
];

const GrowthHackMainActionBar = (props: Props) => {
  // get selected type from URL
  const getCurrentType = () => {
    const currentUrl = window.location.href;

    if (currentUrl.includes('board')) {
      return 'board';
    } else if (currentUrl.includes('weightedScore')) {
      return 'weightedScore';
    } else if (currentUrl.includes('priorityMatrix')) {
      return 'priorityMatrix';
    }

    return 'funnelImpact';
  };

  const getActiveClass = (currentTab: string) => {
    if (window.location.href.includes(currentTab)) {
      return 'active';
    }

    return '';
  };

  const isFiltered = (): boolean => {
    const { location } = props.history;
    const params = queryString.parse(location.search);

    for (const param in params) {
      if (FILTER_PARAMS.includes(param)) {
        return true;
      }
    }

    return false;
  };

  const viewChooser = () => {
    const onFilterClick = (type: string) => {
      const { currentBoard, currentPipeline } = props;

      if (currentBoard && currentPipeline) {
        return `/growthHack/${type}?id=${currentBoard._id}&pipelineId=${
          currentPipeline._id
        }`;
      }

      return `/growthHack/${type}`;
    };

    return (
      <ButtonGroup>
        <Tip text={__('Board')} placement="bottom">
          <Link to={onFilterClick('board')} className={getActiveClass('board')}>
            <Icon icon="window-section" />
          </Link>
        </Tip>
        <Tip text={__('Weighted scoring')} placement="bottom">
          <Link
            to={onFilterClick('weightedScore')}
            className={getActiveClass('weightedScore')}
          >
            <Icon icon="web-section-alt" />
          </Link>
        </Tip>
        <Tip text={__('Priority matrix')} placement="bottom">
          <Link
            to={onFilterClick('priorityMatrix')}
            className={getActiveClass('priorityMatrix')}
          >
            <Icon icon="th" />
          </Link>
        </Tip>
        <Tip text={__('Funnel Impact')} placement="bottom">
          <Link
            to={onFilterClick('funnelImpact')}
            className={getActiveClass('funnelImpact')}
          >
            <Icon icon="window-maximize" />
          </Link>
        </Tip>
      </ButtonGroup>
    );
  };

  const extendedProps = {
    ...props,
    isFiltered,
    link: `/growthHack/${getCurrentType()}`,
    rightContent: viewChooser
  };

  return <MainActionBar {...extendedProps} />;
};

export default GrowthHackMainActionBar;
