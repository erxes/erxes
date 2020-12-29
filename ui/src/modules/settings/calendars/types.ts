import { QueryResponse } from 'modules/common/types';

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

// groups
export type GroupGetLastQueryResponse = {
  calendarGroupGetLast: IGroup;
  loading: boolean;
};

export type GroupsQueryResponse = {
  calendarGroups: IGroup[];
  loading: boolean;
  refetch: ({ boardId }: { boardId?: string }) => Promise<any>;
} & QueryResponse;

export type GroupDetailQueryResponse = {
  calendarGroupDetail: IGroup;
  loading: boolean;
};

export type CalendarsQueryResponse = {
  calendars: ICalendar[];
  loading: boolean;
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
    refetchQueries?: string[];
  }) => Promise<void>;
};

export type EditAccountCalendarMutationVariables = {
  _id: string;
  name?: string;
  color?: string;
  show?: boolean;
};

export type EditAccountCalendarMutationResponse = {
  editMutation: (params: {
    variables: EditAccountCalendarMutationVariables;
    refetchQueries?: any[];
  }) => Promise<void>;
};

export type AddBoardMutationVariables = {
  name: string;
};

export type AddBoardMutationResponse = {
  addMutation: (params: {
    variables: AddBoardMutationVariables;
  }) => Promise<void>;
};

export type EditBoardMutationVariables = {
  _id?: string;
  name: string;
};

export type EditBoardMutationResponse = {
  editMutation: (params: {
    variables: EditBoardMutationVariables;
  }) => Promise<void>;
};

export type RemoveBoardMutationVariables = {
  _id: string;
};

export type RemoveBoardMutationResponse = {
  removeMutation: (params: {
    variables: RemoveBoardMutationVariables;
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

export type openingHour = {
  days: [string];
  start: string;
  end: string;
};

export type additionalField = {
  label: string;
  name: string;
  required: boolean;
  type: string;
};

export type SchedulePageMutationVariables = {
  _id?: string;
  name: string;
  slug: string;
  timezone: string;
  calendarIds: [string];
  event: {
    title: string;
    location: string;
    duration: number;
  };
  appearance?: {
    color: string;
    companyName?: string;
    logo?: string;
    submitText?: string;
    thankYouText?: string;
  };
  booking?: {
    openingHours?: openingHour[];
    additionalFields?: additionalField[];
    cancellationPolicy?: string;
    confirmationMethod?: string;
    minBookingNotice?: number;
    availableDaysInFuture?: number;
    minBuffer?: number;
    minCancellationNotice?: number;
  };
};

export type CreateSchedulePageMutationResponse = {
  createMutation: (params: {
    variables: SchedulePageMutationVariables;
    refetchQueries?: any[];
  }) => Promise<void>;
};

export type EditSchedulePageMutationResponse = {
  editMutation: (params: {
    variables: SchedulePageMutationVariables;
    refetchQueries?: any[];
  }) => Promise<void>;
};

export type RemoveSchedulePageMutationResponse = {
  removeMutation: (params: {
    variables: { pageId: string };
    refetchQueries?: any;
  }) => Promise<void>;
};

export type IPage = {
  _id: string;
  name: string;
  slug: string;
  createdAt: Date;
  modifiedAt: Date;
  accountId: string;
  config: {
    timezone: string;
    pageCalendarIds?: any;
    calendarIds?: string[];
    event: {
      title: string;
      location: string;
      duration: number;
    };
    appearance: {
      color?: string;
      companyName?: string;
      logo?: string;
      submitText?: string;
      thankYouText?: string;
      showAutoschedule?: boolean;
      showNylasBranding?: boolean;
    };
    booking: {
      openingHours: openingHour[];
      additionalFields?: additionalField[];
      cancellationPolicy?: string;
      confirmationMethod?: string;
      minBookingNotice?: number;
      availableDaysInFuture?: number;
      minBuffer?: number;
      minCancellationNotice?: number;
    };
  };
};
