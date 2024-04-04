import * as compose from 'lodash.flowright';

import { Alert, __, confirm, withProps } from 'coreui/utils';
import {
  ArchivePipelineMutationResponse,
  CopiedPipelineMutationResponse,
  IOption,
  RemovePipelineMutationResponse,
  UpdateOrderPipelineMutationResponse,
  UpdateOrderPipelineMutationVariables
} from '../types';
import {
  BoardDetailQueryResponse,
  PipelinesQueryResponse
} from '@erxes/ui-cards/src/boards/types';
import { IButtonMutateProps, MutationVariables } from '@erxes/ui/src/types';
import {
  mutations,
  queries
} from '@erxes/ui-cards/src/settings/boards/graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Pipelines from '../components/Pipelines';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { queries as boardQueries } from '@erxes/ui-cards/src/boards/graphql';
import { getWarningMessage } from '@erxes/ui-cards/src/boards/utils';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  boardId: string;
  type: string;
  options?: IOption;
};

type FinalProps = {
  pipelinesQuery: PipelinesQueryResponse;
  boardDetailQuery: BoardDetailQueryResponse;
} & Props &
  RemovePipelineMutationResponse &
  ArchivePipelineMutationResponse &
  CopiedPipelineMutationResponse &
  UpdateOrderPipelineMutationResponse;

class PipelinesContainer extends React.Component<FinalProps> {
  render() {
    const {
      boardId,
      pipelinesQuery,
      removePipelineMutation,
      archivePipelineMutation,
      copiedPipelineMutation,
      pipelinesUpdateOrderMutation,
      boardDetailQuery
    } = this.props;

    if (pipelinesQuery?.loading) {
      return <Spinner />;
    }

    const pipelines = pipelinesQuery.pipelines || [];

    // archive action
    const archive = (pipelineId: string, status: string) => {
      let message = ` This will archive the current pipeline. Are you absolutely sure?`;
      let action = 'archived';

      if (status === 'archived') {
        message = `This will unarchive the current pipeline. Are you absolutely sure?`;
        action = 'unarchived';
      }
      confirm(message).then(() => {
        archivePipelineMutation({
          variables: { _id: pipelineId },
          refetchQueries: getRefetchQueries(boardId, pipelineId)
        })
          .then(() => {
            pipelinesQuery?.refetch({ boardId });
            const msg = `${__(`You succesfully ${action} a`)} ${__(
              'pipeline'
            )}.`;

            Alert.success(msg);
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    // duplicate action
    const copied = pipelineId => {
      const message = `This will duplicate the current pipeline. Are you absolutely sure?`;
      confirm(message).then(() => {
        copiedPipelineMutation({
          variables: { _id: pipelineId },
          refetchQueries: getRefetchQueries(boardId, pipelineId)
        })
          .then(() => {
            pipelinesQuery?.refetch({ boardId });

            const msg = `${__(`You succesfully duplicated a`)} ${__(
              'pipeline'
            )}.`;

            Alert.success(msg);
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    // remove action
    const remove = pipelineId => {
      confirm(getWarningMessage('Pipeline'), { hasDeleteConfirm: true }).then(
        () => {
          removePipelineMutation({
            variables: { _id: pipelineId },
            refetchQueries: getRefetchQueries(boardId, pipelineId)
          })
            .then(() => {
              pipelinesQuery?.refetch({ boardId });

              const msg = `${__(`You successfully deleted a`)} ${__(
                'pipeline'
              )}.`;

              Alert.success(msg);
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
        pipelinesQuery?.refetch({ boardId });

        if (callback) {
          return callback();
        }
      };

      return (
        <ButtonMutate
          mutation={object ? mutations?.pipelineEdit : mutations?.pipelineAdd}
          variables={values}
          callback={callBackResponse}
          confirmationUpdate={object ? confirmationUpdate : false}
          refetchQueries={getRefetchQueries(boardId, object ? object?._id : '')}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const updateOrder = orders => {
      pipelinesUpdateOrderMutation({
        variables: { orders }
      }).catch(error => {
        Alert.error(error.message);
      });
    };

    const extendedProps = {
      ...this.props,
      pipelines,
      refetch: pipelinesQuery?.refetch,
      loading: pipelinesQuery?.loading,
      remove,
      archive,
      copied,
      renderButton,
      updateOrder,
      currentBoard: boardDetailQuery ? boardDetailQuery?.boardDetail : undefined
    };

    return <Pipelines {...extendedProps} />;
  }
}

const getRefetchQueries = (boardId, pipelineId?: string) => {
  return [
    'pipelinesQuery',
    {
      query: gql(boardQueries?.boardDetail),
      variables: { _id: boardId }
    },
    {
      query: gql(boardQueries?.stages),
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

export default withProps<Props>(
  compose(
    graphql<Props, PipelinesQueryResponse, { boardId: string }>(
      gql(queries?.pipelines),
      {
        name: 'pipelinesQuery',
        options: ({
          boardId = '',
          type
        }: {
          boardId: string;
          type: string;
        }) => ({
          variables: { boardId, type, isAll: true },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, BoardDetailQueryResponse>(gql(queries?.boardDetail), {
      name: 'boardDetailQuery',
      skip: ({ boardId }: { boardId?: string }) => !boardId,
      options: ({ boardId }: { boardId?: string }) => ({
        variables: { _id: boardId },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, RemovePipelineMutationResponse, MutationVariables>(
      gql(mutations?.pipelineRemove),
      {
        name: 'removePipelineMutation'
      }
    ),
    graphql<Props, ArchivePipelineMutationResponse, MutationVariables>(
      gql(mutations?.pipelinesArchive),
      {
        name: 'archivePipelineMutation'
      }
    ),
    graphql<Props, CopiedPipelineMutationResponse, MutationVariables>(
      gql(mutations?.pipelinesCopied),
      {
        name: 'copiedPipelineMutation'
      }
    ),

    graphql<
      Props,
      UpdateOrderPipelineMutationResponse,
      UpdateOrderPipelineMutationVariables
    >(gql(mutations?.pipelinesUpdateOrder), {
      name: 'pipelinesUpdateOrderMutation'
    })
  )(PipelinesContainer)
);
