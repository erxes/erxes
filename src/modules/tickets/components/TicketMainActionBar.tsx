import { MainActionBar } from 'modules/boards/components';
import { IBoard, IPipeline } from 'modules/boards/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';

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
  const extendedProps = {
    ...props,
    link: '/inbox/ticket/board'
  };

  return <MainActionBar {...extendedProps} />;
};

export default TicketMainActionBar;
