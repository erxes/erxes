import gql from 'graphql-tag';
import { PipelinesQueryResponse } from 'modules/boards/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { __, Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import Pipelines from '../components/Pipelines';
import { mutations, queries } from '../graphql';
import {
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
  pipelinesQuery: PipelinesQueryResponse;
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
            pipelinesQuery.refetch({ boardId });

            const msg = `${__(`You successfully deleted a`)} ${__(
              'pipeline'
            )}.`;

            Alert.success(msg);
          })
          .catch(error => {
            Alert.error(
              `Please remove all stages in this pipeline before delete the pipeline`
            );
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
    graphql<Props, PipelinesQueryResponse, { boardId: string }>(
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
