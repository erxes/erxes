import { IUser } from '@erxes/ui/src/auth/types';
import { QueryResponse } from '@erxes/ui/src/types';
import { IIntegration } from '../integrations/types';

export interface IChannel {
  _id: string;
  name: string;
  description?: string;
  integrationIds: string[];
  memberIds: string[];
  members: IUser[];
}

export interface IChannelDoc extends IChannel {
  integrations: IIntegration[];
}

// query types
export type ChannelsQueryResponse = {
  channels: IChannel[];
} & QueryResponse;
