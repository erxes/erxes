import { IUser } from 'modules/auth/types';
import { QueryResponse } from 'modules/common/types';
import { IIntegration } from 'modules/settings/integrations/types';

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

export type ChannelDetailQueryResponse = {
  channelDetail: IChannel;
} & QueryResponse;

export type ChannelsGetLastQueryResponse = {
  channelsGetLast: IChannel;
} & QueryResponse;

export type ChannelsCountQueryResponse = {
  channelsTotalCount: number;
} & QueryResponse;

// mutation types
export type ChannelMutationVariables = {
  name: string;
  description: string;
  memberIds: string[];
  integrationIds: string[];
};

export type AddChannelMutationResponse = {
  addMutation: (params: {
    variables: ChannelMutationVariables;
  }) => Promise<void>;
};

export type EditChannelMutationVariables = {
  _id?: string;
  name: string;
  memberIds: string[];
  description?: string;
  integrationIds: string[];
};

export type EditChannelMutationResponse = {
  editMutation: (params: {
    variables: EditChannelMutationVariables;
  }) => Promise<void>;
};

export type RemoveChannelMutationVariables = {
  _id: string;
};

export type RemoveChannelMutationResponse = {
  removeMutation: (params: {
    variables: RemoveChannelMutationVariables;
  }) => Promise<void>;
};
