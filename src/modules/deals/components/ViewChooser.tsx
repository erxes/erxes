import { IBoard, IPipeline } from 'modules/boards/types';
import { Icon } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { ButtonGroup } from 'modules/deals/styles/header';
import * as React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  type: string;
  currentBoard?: IBoard;
  currentPipeline?: IPipeline;
};

// get selected deal type from URL
const getType = () =>
  window.location.href.includes('calendar') ? 'calendar' : 'board';

export default (props: Props) => {
  const { type } = props;

  if (type !== 'deal') {
    return null;
  }

  const onFilterClick = (viewType: string) => {
    const { currentBoard, currentPipeline } = props;

    if (currentBoard && currentPipeline) {
      return `/deal/${viewType}?id=${currentBoard._id}&pipelineId=${
        currentPipeline._id
      }`;
    }

    return `/deal/${viewType}`;
  };

  const boardLink = onFilterClick('board');
  const calendarLink = onFilterClick('calendar');

  return (
    <ButtonGroup>
      <Link to={boardLink} className={getType() === 'board' ? 'active' : ''}>
        <Icon icon="layout" />
        {__('Board')}
      </Link>
      <Link
        to={calendarLink}
        className={getType() === 'calendar' ? 'active' : ''}
      >
        <Icon icon="calendar" />
        {__('Calendar')}
      </Link>
    </ButtonGroup>
  );
};
