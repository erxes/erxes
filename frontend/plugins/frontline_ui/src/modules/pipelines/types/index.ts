import { IUser } from 'ui-modules';
export interface IPipeline {
  _id: string;
  channelId: string;
  createdAt: string;
  description: string;
  name: string;
  updatedAt: string;
  userId: string;
  createdUser: IUser;
}

export interface ITicketsPipelineFilter {
  filter: {
    channelId?: string;
    cursor?: string;
    aggregationPipeline?: JSON;
    cursorMode?: 'inclusive' | 'exclusive';
    direction?: 'forward' | 'backward';
    limit?: number;
    name?: string;
    orderBy?: any;
    sortMode?: string;
    userId?: string;
  };
}
export * from './PipelineHotkeyScope';
