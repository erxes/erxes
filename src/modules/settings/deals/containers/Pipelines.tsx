import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { __, Alert, confirm } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Pipelines } from '../components';
import { mutations, queries } from '../graphql';
import { IPipeline, IStage } from '../types';

type Props = {
  boardId: string;
  pipelinesQuery: any;

  addPipelineMutation: (
    params: {
      variables: {
        name: string;
        boardId: string;
        stages: IStage[];
      };
    }
  ) => Promise<any>;
  editPipelineMutation: (
    params: {
      variables: {
        name: string;
        boardId: string;
        stages: IStage[];
      };
    }
  ) => Promise<any>;
  removePipelineMutation: (
    params: { variables: { _id: string } }
  ) => Promise<any>;
  pipelinesUpdateOrderMutation: (
    params: { variables: { orders: IPipeline[] } }
  ) => Promise<any>;
};

class PipelinesContainer extends React.Component<Props> {
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
    const remove = _id => {
      confirm().then(() => {
        removePipelineMutation({
          variables: { _id }
        })
          .then(() => {
            pipelinesQuery.refetch();

            Alert.success(__('Successfully deleted.'));
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

          Alert.success(__('Successfully saved.'));

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

export default compose(
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ boardId = '' }: { boardId: string }) => ({
      variables: { boardId },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.pipelineAdd), {
    name: 'addPipelineMutation'
  }),
  graphql(gql(mutations.pipelineEdit), {
    name: 'editPipelineMutation'
  }),
  graphql(gql(mutations.pipelineRemove), {
    name: 'removePipelineMutation'
  }),
  graphql(gql(mutations.pipelinesUpdateOrder), {
    name: 'pipelinesUpdateOrderMutation'
  })
)(PipelinesContainer);
