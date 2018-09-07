import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import { Spinner } from 'modules/common/components';
import { Pipelines } from '../components';
import { queries, mutations } from '../graphql';

class PipelinesContainer extends React.Component {
  render() {
    const {
      pipelinesQuery,
      addPipelineMutation,
      editPipelineMutation,
      removePipelineMutation,
      pipelinesUpdateOrderMutation
    } = this.props;

    const { __ } = this.context;

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

PipelinesContainer.propTypes = {
  pipelinesQuery: PropTypes.object,
  addPipelineMutation: PropTypes.func,
  editPipelineMutation: PropTypes.func,
  removePipelineMutation: PropTypes.func,
  pipelinesUpdateOrderMutation: PropTypes.func
};

PipelinesContainer.contextTypes = {
  __: PropTypes.func
};

export default compose(
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ boardId = '' }) => ({
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
