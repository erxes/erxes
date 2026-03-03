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
  visibilityType?: string;
  memberIds?: string[];
  canMoveMemberIds?: string[];
  canEditMemberIds?: string[];
  departmentIds?: string[];
  state?: string;
  probability?: number;
  members?: string[];
  department?: string;
  canMoveMember?: boolean;
  canEditMember?: boolean;
}

export interface ITicketStatusChoice {
  value: string;
  label: string;
  color: string;
  type: number;
}
