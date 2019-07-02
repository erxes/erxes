import gql from 'graphql-tag';
import { ButtonMutate, Spinner } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { __, Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { Pipelines } from '../components';
import { mutations, queries } from '../graphql';
import {
  PipelineQueryResponse,
  RemovePipelineMutationResponse,
  RemovePipelineMutationVariables,
  UpdateOrderPipelineMutationResponse,
  UpdateOrderPipelineMutationVariables
} from '../types';

type Props = {
  boardId: string;
  type: string;
};

type FinalProps = {
  pipelinesQuery: PipelineQueryResponse;
} & Props &
  RemovePipelineMutationResponse &
  UpdateOrderPipelineMutationResponse;

class PipelinesContainer extends React.Component<FinalProps> {
  render() {
    const {
      boardId,
      pipelinesQuery,
      removePipelineMutation,
      pipelinesUpdateOrderMutation
    } = this.props;

    if (pipelinesQuery.loading) {
      return <Spinner />;
    }

    const pipelines = pipelinesQuery.pipelines;

    // remove action
    const remove = pipelineId => {
      confirm().then(() => {
        removePipelineMutation({
          variables: { _id: pipelineId }
        })
          .then(() => {
            pipelinesQuery.refetch();

            const msg = `${__(`You successfully deleted a`)} ${__(
              'pipeline'
            )}.`;

            Alert.success(msg);
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
          mutation={object ? mutations.pipelineEdit : mutations.pipelineAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries(boardId)}
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
      updateOrder
    };

    return <Pipelines {...extendedProps} />;
  }
}

const getRefetchQueries = (boardId: string) => {
  return [
    { query: gql(queries.pipelines), variables: { boardId: boardId || '' } }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, PipelineQueryResponse, { boardId: string }>(
      gql(queries.pipelines),
      {
        name: 'pipelinesQuery',
        options: ({ boardId = '' }: { boardId: string }) => ({
          variables: { boardId },
          fetchPolicy: 'network-only'
        })
      }
    ),
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
