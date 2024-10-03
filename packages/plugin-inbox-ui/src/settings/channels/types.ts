import { IChannel } from "@erxes/ui-inbox/src/settings/channels/types";
import { MutationVariables, QueryResponse } from "@erxes/ui/src/types";

// query types

export type ChannelDetailQueryResponse = {
  channelDetail: IChannel;
} & QueryResponse;

export type ChannelsGetLastQueryResponse = {
  channelsGetLast: IChannel;
} & QueryResponse;

export type ChannelsCountQueryResponse = {
  channelsTotalCount: number;
} & QueryResponse;

export type ChannelsRemoveMutationResponse = {
  removeMutation: (params: { variables: MutationVariables }) => Promise<void>;
};

// mutation types
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
