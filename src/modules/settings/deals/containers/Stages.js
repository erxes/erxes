import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { Stages } from '../components';

const StagesContainer = props => {
  const { stagesQuery, addMutation, editMutation, removeMutation } = props;

  const stages = stagesQuery.dealStages || [];

  // remove action
  const remove = _id => {
    confirm().then(() => {
      removeMutation({
        variables: { ids: [_id] }
      })
        .then(() => {
          stagesQuery.refetch();

          Alert.success('Successfully deleted.');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  // create or update action
  const save = ({ doc }, callback, board) => {
    let mutation = addMutation;
    // if edit mode
    if (board) {
      mutation = editMutation;
      doc._id = board._id;
    }

    mutation({
      variables: doc
    })
      .then(() => {
        stagesQuery.refetch();

        Alert.success('Successfully saved!');

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const extendedProps = {
    ...props,
    stages,
    save,
    remove,
    loading: stagesQuery.loading
  };

  return <Stages {...extendedProps} />;
};

StagesContainer.propTypes = {
  stagesQuery: PropTypes.object,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  removeMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ pipelineId }) => ({
      variables: { pipelineId }
    })
  }),
  graphql(gql(mutations.stageAdd), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.stageEdit), {
    name: 'editMutation'
  }),
  graphql(gql(mutations.stageRemove), {
    name: 'removeMutation'
  })
)(StagesContainer);
