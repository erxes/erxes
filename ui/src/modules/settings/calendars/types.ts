import { QueryResponse } from 'modules/common/types';

// queries
export interface ICalendar {
  _id: string;
  name: string;
  color: string;
  groupId: string;
  accountId: string;
}

export interface IGroup {
  _id: string;
  name: string;
  isPrivate: boolean;
  calendars: ICalendar[];
}

export type GroupGetLastQueryResponse = {
  calendarGroupGetLast: IGroup;
  loading: boolean;
};

export type GroupsQueryResponse = {
  calendarGroups: IGroup[];
} & QueryResponse;

export type GroupDetailQueryResponse = {
  calendarGroupDetail: IGroup;
  loading: boolean;
};

export type CalendarsQueryResponse = {
  calendars: ICalendar[];
  loading: boolean;
  refetch: ({ groupId }: { groupId?: string }) => Promise<any>;
};

// mutations
export type AddGroupMutationVariables = {
  name: string;
};

export type AddGroupMutationResponse = {
  addMutation: (params: {
    variables: AddGroupMutationVariables;
  }) => Promise<void>;
};

export type EditGroupMutationVariables = {
  _id?: string;
  name: string;
};

export type EditGroupMutationResponse = {
  editMutation: (params: {
    variables: EditGroupMutationVariables;
  }) => Promise<void>;
};

export type RemoveGroupMutationVariables = {
  _id: string;
};

export type RemoveGroupMutationResponse = {
  removeMutation: (params: {
    variables: RemoveGroupMutationVariables;
    refetchQueries: string[];
  }) => Promise<void>;
};

export type RemoveCalendarMutationVariables = {
  _id: string;
  accountId: string;
};

export type RemoveCalendarMutationResponse = {
  removeCalendarMutation: (params: {
    variables: RemoveCalendarMutationVariables;
    refetchQueries: any[];
  }) => Promise<void>;
};
