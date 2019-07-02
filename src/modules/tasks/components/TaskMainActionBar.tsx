import { MainActionBar } from 'modules/boards/components';
import { IBoard, IPipeline } from 'modules/boards/types';
import React from 'react';

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
  const extendedProps = {
    ...props,
    link: '/task/board'
  };

  return <MainActionBar {...extendedProps} />;
};

export default TaskMainActionBar;
