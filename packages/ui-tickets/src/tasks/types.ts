import { IItem } from "../boards/types";

export type ITicket = IItem;

export type EditMutationVariables = {
  _id: string;
  name?: string;
  assignedUserIds: string[];
  closeDate: Date;
  description: string;
  reminderMinute: number;
  isComplete: boolean;
};

export type EditMutationResponse = ({
  variables: EditMutationVariables
}) => Promise<any>;

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<void>;
};

export type TicketDetailQueryResponse = {
  taskDetail: ITicket;
  loading: boolean;
  refetch: () => void;
};

export type TicketsQueryResponse = {
  tickets: ITicket[];
  loading: boolean;
  refetch: () => void;
  fetchMore: any;
};

export type TicketsTotalCountQueryResponse = {
  ticketsTotalCount: number;
  loading: boolean;
  refetch: () => void;
  fetchMore: any;
};
