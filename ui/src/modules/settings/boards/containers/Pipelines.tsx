import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import {
  BoardDetailQueryResponse,
  PipelinesQueryResponse
} from 'modules/boards/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { __, Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Pipelines from '../components/Pipelines';
import { getWarningMessage } from '../constants';
import { mutations, queries } from '../graphql';
import {
  IOption,
  RemovePipelineMutationResponse,
  RemovePipelineMutationVariables,
  UpdateOrderPipelineMutationResponse,
  UpdateOrderPipelineMutationVariables
} from '../types';

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
  UpdateOrderPipelineMutationResponse;

class PipelinesContainer extends React.Component<FinalProps> {
  render() {
    const {
      boardId,
      pipelinesQuery,
      removePipelineMutation,
      pipelinesUpdateOrderMutation,
      boardDetailQuery
    } = this.props;

    if (pipelinesQuery.loading) {
      return <Spinner />;
    }

    const pipelines = pipelinesQuery.pipelines;

    // remove action
    const remove = pipelineId => {
      confirm(getWarningMessage('Pipeline'), { hasDeleteConfirm: true }).then(
        () => {
          removePipelineMutation({
            variables: { _id: pipelineId }
          })
            .then(() => {
              pipelinesQuery.refetch({ boardId });

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
        pipelinesQuery.refetch({ boardId });

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
          refetchQueries={getRefetchQueries()}
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
      refetch: pipelinesQuery.refetch,
      loading: pipelinesQuery.loading,
      remove,
      renderButton,
      updateOrder,
      currentBoard: boardDetailQuery ? boardDetailQuery.boardDetail : undefined
    };

    return <Pipelines {...extendedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['pipelinesQuery'];
};

export default withProps<Props>(
  compose(
    graphql<Props, PipelinesQueryResponse, { boardId: string }>(
      gql(queries.pipelines),
      {
        name: 'pipelinesQuery',
        options: ({
          boardId = '',
          type
        }: {
          boardId: string;
          type: string;
        }) => ({
          variables: { boardId, type },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, BoardDetailQueryResponse>(gql(queries.boardDetail), {
      name: 'boardDetailQuery',
      skip: ({ boardId }: { boardId?: string }) => !boardId,
      options: ({ boardId }: { boardId?: string }) => ({
        variables: { _id: boardId },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<
      Props,
      RemovePipelineMutationResponse,
      RemovePipelineMutationVariables
    >(gql(mutations.pipelineRemove), {
      name: 'removePipelineMutation'
    }),
    graphql<
      Props,
      UpdateOrderPipelineMutationResponse,
      UpdateOrderPipelineMutationVariables
    >(gql(mutations.pipelinesUpdateOrder), {
      name: 'pipelinesUpdateOrderMutation'
    })
  )(PipelinesContainer)
);
