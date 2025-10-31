export interface ITicketStatus {
  _id: string;
  channelId: string;
  color: string;
  createdAt: string;
  description: string;
  name: string;
  order: number;
  pipelineId: string;
  type: number;
  updatedAt: string;
}

export interface ITicketStatusChoice {
  value: string;
  label: string;
  color: string;
  type: number;
}

