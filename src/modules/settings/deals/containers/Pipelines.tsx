import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { __, Alert, confirm, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Pipelines } from '../components';
import { mutations, queries } from '../graphql';
import {
  AddPipelineMutationResponse,
  AddPipelineMutationVariables,
  EditPipelineMutationResponse,
  EditPipelineMutationVariables,
  PipelineQueryResponse,
  RemovePipelineMutationResponse,
  RemovePipelineMutationVariables,
  UpdateOrderPipelineMutationResponse,
  UpdateOrderPipelineMutationVariables
} from '../types';

type Props = {
  boardId: string;
};

type FinalProps = {
  pipelinesQuery: PipelineQueryResponse;
} & Props &
  AddPipelineMutationResponse &
  EditPipelineMutationResponse &
  RemovePipelineMutationResponse &
  UpdateOrderPipelineMutationResponse;

class PipelinesContainer extends React.Component<FinalProps> {
  render() {
    const {
      pipelinesQuery,
      addPipelineMutation,
      editPipelineMutation,
      removePipelineMutation,
      pipelinesUpdateOrderMutation
    } = this.props;

    if (pipelinesQuery.loading) {
      return <Spinner />;
    }

    const pipelines = pipelinesQuery.dealPipelines;

    // remove action
    const remove = pipelineId => {
      confirm().then(() => {
        removePipelineMutation({
          variables: { _id: pipelineId }
        })
          .then(() => {
            pipelinesQuery.refetch();

            const msg = `${__(`You successfully deleted a`)}' '${__(
              'pipeline'
            )}.`;

            Alert.success(msg);
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    // create or update action
    const save = ({ doc }, callback, pipeline) => {
      let mutation = addPipelineMutation;
      // if edit mode
      if (pipeline) {
        mutation = editPipelineMutation;
        doc._id = pipeline._id;
      }

      mutation({
        variables: doc
      })
        .then(() => {
          pipelinesQuery.refetch();

          Alert.success(
            __(`You successfully ${pipeline ? 'updated' : 'added'} a pipeline.`)
          );

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
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
      save,
      updateOrder
    };

    return <Pipelines {...extendedProps} />;
  }
}

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
    graphql<Props, AddPipelineMutationResponse, AddPipelineMutationVariables>(
      gql(mutations.pipelineAdd),
      {
        name: 'addPipelineMutation'
      }
    ),
    graphql<Props, EditPipelineMutationResponse, EditPipelineMutationVariables>(
      gql(mutations.pipelineEdit),
      {
        name: 'editPipelineMutation'
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
