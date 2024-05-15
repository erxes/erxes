import * as compose from "lodash.flowright";

import { Alert, confirm, withProps } from "@erxes/ui/src/utils";
import {
  CopyMutationResponse,
  IEngageMessage,
  RemoveMutationResponse,
  SetLiveManualMutationResponse,
  SetLiveMutationResponse,
  SetPauseMutationResponse,
} from "@erxes/ui-engage/src/types";
import { mutations, queries } from "@erxes/ui-engage/src/graphql";

import MessageListRow from "../components/MessageListRow";
import { MutationVariables } from "@erxes/ui/src/types";
import React from "react";
import { crudMutationsOptions } from "@erxes/ui-engage/src/utils";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { useNavigate } from "react-router-dom";

type Props = {
  isChecked: boolean;
  toggleBulk: (value: IEngageMessage, isChecked: boolean) => void;
  message: IEngageMessage;
  queryParams: any;
  refetch: () => void;
};

type FinalProps = Props &
  RemoveMutationResponse &
  SetPauseMutationResponse &
  SetLiveMutationResponse &
  SetLiveManualMutationResponse &
  CopyMutationResponse;

const MessageRowContainer = (props: FinalProps) => {
  const {
    copyMutation,
    message,
    removeMutation,
    setPauseMutation,
    setLiveMutation,
    setLiveManualMutation,
    isChecked,
    toggleBulk,
    refetch,
  } = props;
  const navigate = useNavigate();

  const doMutation = (mutation, msg: string) =>
    mutation({
      variables: { _id: message._id },
    })
      .then(() => {
        Alert.success(msg);
      })
      .catch((error) => {
        Alert.error(error.message);
      });

  const edit = () => {
    navigate(`/campaigns/edit/${message._id}`);
  };

  const show = () => {
    navigate(`/campaigns/show/${message._id}`);
  };

  const remove = () => {
    confirm().then(() => {
      doMutation(removeMutation, `You just deleted a broadcast.`)
        .then(() => {
          navigate("/campaigns");
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const setLiveManual = () =>
    doMutation(setLiveManualMutation, "Yay! Your broadcast is now live.");
  const setLive = () =>
    doMutation(setLiveMutation, "Yay! Your broadcast is now live.");
  const setPause = () =>
    doMutation(setPauseMutation, "Your broadcast is paused for now.");
  const copy = () => {
    doMutation(copyMutation, "broadcast has been duplicated.").then(() => {
      refetch();
    });
  };

  const updatedProps = {
    ...props,
    edit,
    show,
    remove,
    setLive,
    setLiveManual,
    setPause,
    isChecked,
    toggleBulk,
    copy,
  };

  return <MessageListRow {...updatedProps} />;
};

const statusMutationsOptions = ({ queryParams, message }) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.statusCounts),
        variables: {
          kind: queryParams.kind || "",
        },
      },
      {
        query: gql(queries.engageMessageDetail),
        variables: {
          _id: message._id,
        },
      },
      {
        query: gql(queries.engageMessages),
      },
    ],
  };
};

export default withProps<Props>(
  compose(
    graphql<Props, RemoveMutationResponse, MutationVariables>(
      gql(mutations.messageRemove),
      {
        name: "removeMutation",
        options: crudMutationsOptions,
      }
    ),
    graphql<Props, SetPauseMutationResponse, MutationVariables>(
      gql(mutations.setPause),
      {
        name: "setPauseMutation",
        options: statusMutationsOptions,
      }
    ),
    graphql<Props, SetLiveMutationResponse, MutationVariables>(
      gql(mutations.setLive),
      {
        name: "setLiveMutation",
        options: statusMutationsOptions,
      }
    ),
    graphql<Props, SetLiveManualMutationResponse, MutationVariables>(
      gql(mutations.setLiveManual),
      {
        name: "setLiveManualMutation",
        options: statusMutationsOptions,
      }
    ),
    graphql(gql(mutations.engageMessageCopy), {
      name: "copyMutation",
    })
  )(MessageRowContainer)
);
