import { IUser } from '@erxes/ui/src/auth/types';
import { QueryResponse } from '@erxes/common-ui-settings/src/common/types';

export interface IChannel {
  _id: string;
  name: string;
  description?: string;
  integrationIds: string[];
  memberIds: string[];
  members: IUser[];
}

// query types
export type ChannelsQueryResponse = {
  channels: IChannel[];
} & QueryResponse;
