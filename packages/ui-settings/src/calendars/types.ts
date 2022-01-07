import { QueryResponse } from '@erxes/ui/src/types';

// queries
export interface ICalendar {
  _id: string;
  name: string;
  color: string;
  groupId: string;
  accountId: string;
  userId: string;
}

export interface IGroup {
  _id: string;
  name: string;
  isPrivate: boolean;
  boardId: string;
  memberIds: string[];
  calendars: ICalendar[];
}
export interface IBoard {
  _id: string;
  name: string;
  groups: IGroup[];
}

// boards
export type BoardGetLastQueryResponse = {
  calendarBoardGetLast: IBoard;
  loading: boolean;
};

export type BoardsQueryResponse = {
  calendarBoards: IBoard[];
} & QueryResponse;

export type BoardDetailQueryResponse = {
  calendarBoardDetail: IBoard;
  loading: boolean;
};
