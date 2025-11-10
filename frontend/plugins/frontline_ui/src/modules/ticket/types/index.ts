import { addTicketSchema } from './validations';
import { z } from 'zod';

export interface ITicket {
  _id: string;
  name: string;
  description: string;
  statusId: string;
  priority: number;
  labelIds: string[];
  tagIds: string[];
  assigneeId: string;
  userId: string;
  startDate: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  channelId: string;
  statusChangedDate: string;
  number: number;
  pipelineId: string;
}

export interface IActivity {
  _id: string;
  module: string;
  action: string;
  contentId: string;
  metadata: {
    newValue: string;
    previousValue?: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TAddTicket = z.infer<typeof addTicketSchema>;

export * from './validations';
export * from './TicketHotkeyScope';
