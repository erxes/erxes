import { IUser } from 'modules/auth/types';
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
  loading: boolean;
  refetch: () => void;
};

export type ChannelDetailQueryResponse = {
  channelDetail: IChannel;
  loading: boolean;
  refetch: () => void;
};

export type ChannelsGetLastQueryResponse = {
  channelsGetLast: IChannel;
  loading: boolean;
  refetch: () => void;
};

export type ChannelsCountQueryResponse = {
  channelsTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

// mutation types
export type ChannelMutationVariables = {
  name: string;
  description: string;
  memberIds: string[];
  integrationIds: string[];
};

export type AddChannelMutationResponse = {
  addMutation: (
    params: {
      variables: ChannelMutationVariables;
    }
  ) => Promise<void>;
};

export type EditChannelMutationVariables = {
  _id?: string;
  name: string;
  memberIds: string[];
  description?: string;
  integrationIds: string[];
};

export type EditChannelMutationResponse = {
  editMutation: (
    params: {
      variables: EditChannelMutationVariables;
    }
  ) => Promise<void>;
};

export type RemoveChannelMutationVariables = {
  _id: string;
};

export type RemoveChannelMutationResponse = {
  removeMutation: (
    params: {
      variables: RemoveChannelMutationVariables;
    }
  ) => Promise<void>;
};
