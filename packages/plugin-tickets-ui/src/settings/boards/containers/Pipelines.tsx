import { Alert, __, confirm } from "coreui/utils";
import {
  ArchivePipelineMutationResponse,
  CopiedPipelineMutationResponse,
  IOption,
  RemovePipelineMutationResponse,
  UpdateOrderPipelineMutationResponse,
  UpdateOrderPipelineMutationVariables
} from "../types";
import {
  BoardDetailQueryResponse,
  PipelinesQueryResponse
} from "@erxes/ui-tickets/src/boards/types";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import {
  mutations,
  queries
} from "@erxes/ui-tickets/src/settings/boards/graphql";

import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import Pipelines from "../components/Pipelines";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import { queries as boardQueries } from "@erxes/ui-tickets/src/boards/graphql";
import { getWarningMessage } from "@erxes/ui-tickets/src/boards/utils";
import { gql, useQuery, useMutation } from "@apollo/client";

type Props = {
  boardId: string;
  type: string;
  options?: IOption;
};

const GET_PIPELINES = gql(queries.pipelines);
const GET_BOARD_DETAIL = gql(queries.boardDetail);
const REMOVE_PIPELINE = gql(mutations.pipelineRemove);
const ARCHIVE_PIPELINE = gql(mutations.pipelinesArchive);
const COPY_PIPELINE = gql(mutations.pipelinesCopied);
const UPDATE_ORDER = gql(mutations.pipelinesUpdateOrder);

const PipelinesContainer: React.FC<Props> = (props: Props) => {
  const { boardId, type } = props;
  const {
    data: pipelinesData,
    loading: pipelinesLoading,
    refetch: refetchPipelines
  } = useQuery<PipelinesQueryResponse>(GET_PIPELINES, {
    variables: { boardId, type, isAll: true },
    fetchPolicy: "network-only"
  });

  const { data: boardDetailData } = useQuery<BoardDetailQueryResponse>(
    GET_BOARD_DETAIL,
    {
      variables: { _id: boardId },
      fetchPolicy: "network-only",
      skip: !boardId
    }
  );

  const [removePipelineMutation] =
    useMutation<RemovePipelineMutationResponse>(REMOVE_PIPELINE);
  const [archivePipelineMutation] =
    useMutation<ArchivePipelineMutationResponse>(ARCHIVE_PIPELINE);
  const [copiedPipelineMutation] =
    useMutation<CopiedPipelineMutationResponse>(COPY_PIPELINE);
  const [pipelinesUpdateOrderMutation] = useMutation<
    UpdateOrderPipelineMutationResponse,
    UpdateOrderPipelineMutationVariables
  >(UPDATE_ORDER);

  if (pipelinesLoading) {
    return <Spinner />;
  }

  const pipelines = pipelinesData?.ticketsPipelines || [];

  const archive = (pipelineId: string, status: string) => {
    let message = `This will archive the current pipeline. Are you absolutely sure?`;
    let action = "archived";

    if (status === "archived") {
      message = `This will unarchive the current pipeline. Are you absolutely sure?`;
      action = "unarchived";
    }

    let successMessage = __(`You successfully ${action} a`);

    confirm(message).then(() => {
      archivePipelineMutation({
        variables: { _id: pipelineId },
        refetchQueries: getRefetchQueries(boardId, pipelineId)
      })
        .then(() => {
          refetchPipelines({ boardId });
          Alert.success(`${successMessage} ${__("pipeline")}.`);
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const copied = (pipelineId: string) => {
    confirm(__(
      `This will duplicate the current pipeline. Are you absolutely sure?`
    )).then(() => {
      copiedPipelineMutation({
        variables: { _id: pipelineId },
        refetchQueries: getRefetchQueries(boardId, pipelineId)
      })
        .then(() => {
          refetchPipelines({ boardId });
          Alert.success(
            `${__("You successfully duplicated a")} ${__("pipeline")}.`
          );
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const remove = (pipelineId: string) => {
    confirm(getWarningMessage("Pipeline"), { hasDeleteConfirm: true }).then(
      () => {
        removePipelineMutation({
          variables: { _id: pipelineId },
          refetchQueries: getRefetchQueries(boardId, pipelineId)
        })
          .then(() => {
            refetchPipelines({ boardId });
            Alert.success(
              `${__("You successfully deleted a")} ${__("pipeline")}.`
            );
          })
          .catch(error => {
            Alert.error(error.message);
          });
      }
    );
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object,
    confirmationUpdate
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      refetchPipelines({ boardId });
      if (callback) {
        return callback();
      }
    };

    return (
      <ButtonMutate
        mutation={object ? mutations.pipelineEdit : mutations.pipelineAdd}
        variables={values}
        callback={callBackResponse}
        confirmationUpdate={object ? confirmationUpdate : false}
        refetchQueries={getRefetchQueries(boardId, object ? object._id : "")}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${object ? "updated" : "added"} a ${name}`}
      />
    );
  };

  const updateOrder = (orders: any) => {
    pipelinesUpdateOrderMutation({
      variables: { orders }
    }).catch(error => {
      Alert.error(error.message);
    });
  };

  const extendedProps = {
    ...props,
    pipelines,
    refetch: refetchPipelines,
    loading: pipelinesLoading,
    remove,
    archive,
    copied,
    renderButton,
    updateOrder,
    currentBoard: boardDetailData
      ? boardDetailData.ticketsBoardDetail
      : undefined
  };

  return <Pipelines {...extendedProps} />;
};

const getRefetchQueries = (boardId, pipelineId?: string) => {
  return [
    "pipelinesQuery",
    {
      query: GET_BOARD_DETAIL,
      variables: { _id: boardId }
    },
    {
      query: gql(boardQueries.stages),
      variables: {
        pipelineId,
        search: undefined,
        customerIds: undefined,
        companyIds: undefined,
        assignedUserIds: undefined,
        labelIds: undefined,
        extraParams: {},
        closeDateType: undefined,
        userIds: undefined
      }
    }
  ];
};

export default PipelinesContainer;
