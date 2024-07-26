import * as compose from "lodash.flowright";

import { Alert, confirm, withProps } from "@erxes/ui/src/utils";
import { IButtonMutateProps, MutationVariables } from "@erxes/ui/src/types";
import { mutations, queries } from "../graphql";

import { AppConsumer } from "coreui/appContext";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import {
  ChannelsCountQueryResponse,
  ChannelsRemoveMutationResponse
} from "../types";
import { ChannelsQueryResponse } from "@erxes/ui-inbox/src/settings/channels/types";
import React from "react";
import Sidebar from "../components/Sidebar";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import inboxQueries from "@erxes/ui-inbox/src/inbox/graphql/queries";
import { useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  currentChannelId?: string;
  currentUserId?: string;
};

type FinalProps = {
  channelsQuery: ChannelsQueryResponse;
  channelsCountQuery: ChannelsCountQueryResponse;
} & Props &
  ChannelsRemoveMutationResponse;

const SidebarContainer = (props: FinalProps) => {
  const {
    channelsQuery,
    channelsCountQuery,
    removeMutation,
    queryParams,
    currentChannelId,
    currentUserId
  } = props;
  const navigate = useNavigate();
  const channels = channelsQuery.channels || [];
  const channelsTotalCount = channelsCountQuery.channelsTotalCount || 0;

  // remove action
  const remove = channelId => {
    confirm("This will permanently delete are you absolutely sure?", {
      hasDeleteConfirm: true
    }).then(() => {
      removeMutation({
        variables: { _id: channelId }
      })
        .then(() => {
          Alert.success("You successfully deleted a channel.");

          navigate("/settings/channels");
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.channelEdit : mutations.channelAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(
          queryParams,
          currentChannelId,
          currentUserId
        )}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    channels,
    channelsTotalCount,
    remove,
    renderButton,
    loading: channelsQuery.loading
  };

  return <Sidebar {...updatedProps} />;
};

const getRefetchQueries = (
  queryParams,
  currentChannelId?: string,
  currentUserId?: string
) => {
  return [
    {
      query: gql(queries.channels),
      variables: {
        perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
      }
    },
    {
      query: gql(queries.channels),
      variables: {}
    },
    {
      query: gql(queries.integrationsCount),
      variables: {}
    },
    {
      query: gql(queries.channelDetail),
      variables: { _id: currentChannelId || "" }
    },
    { query: gql(queries.channelsCount) },
    {
      query: gql(inboxQueries.channelList),
      variables: { memberIds: [currentUserId] }
    }
  ];
};

const WithProps = withProps<Props>(
  compose(
    graphql<Props, ChannelsQueryResponse, { perPage: number }>(
      gql(queries.channels),
      {
        name: "channelsQuery",
        options: ({ queryParams }: { queryParams: any }) => ({
          variables: {
            perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
          },
          fetchPolicy: "network-only"
        })
      }
    ),
    graphql<Props, ChannelsCountQueryResponse, {}>(gql(queries.channelsCount), {
      name: "channelsCountQuery"
    }),
    graphql<Props, RemovePipelineLabelMutationResponse, MutationVariables>(
      gql(mutations.channelRemove),
      {
        name: "removeMutation",
        options: ({ queryParams, currentChannelId, currentUserId }: Props) => ({
          refetchQueries: getRefetchQueries(
            queryParams,
            currentChannelId,
            currentUserId
          )
        })
      }
    )
  )(SidebarContainer)
);

export default (props: Props) => (
  <AppConsumer>
    {({ currentUser }) => (
      <WithProps
        {...props}
        currentUserId={(currentUser && currentUser._id) || ""}
      />
    )}
  </AppConsumer>
);
