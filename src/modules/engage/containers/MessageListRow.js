import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import { MessageListRow } from '../components';
import { queries, mutations } from '../graphql';
import { crudMutationsOptions } from '../utils';

const MessageRowContainer = props => {
  const {
    history,
    message,
    removeMutation,
    setPauseMutation,
    setLiveMutation,
    setLiveManualMutation
  } = props;

  const doMutation = mutation =>
    mutation({
      variables: { _id: message._id }
    })
      .then(() => {
        Alert.success('Congrats');
      })
      .catch(error => {
        Alert.error(error.message);
      });

  const edit = () => {
    history.push(`/engage/messages/edit/${message._id}`);
  };

  const remove = () => {
    confirm().then(() => {
      doMutation(removeMutation).then(() => {
        history.push('/engage');
      });
    });
  };

  const setLiveManual = () => doMutation(setLiveManualMutation);
  const setLive = () => doMutation(setLiveMutation);
  const setPause = () => doMutation(setPauseMutation);

  const updatedProps = {
    ...props,
    edit,
    remove,
    setLive,
    setLiveManual,
    setPause
  };

  return <MessageListRow {...updatedProps} />;
};

MessageRowContainer.propTypes = {
  history: PropTypes.object,
  message: PropTypes.object,
  removeMutation: PropTypes.func,
  setPauseMutation: PropTypes.func,
  setLiveMutation: PropTypes.func,
  setLiveManualMutation: PropTypes.func
};

const statusMutationsOptions = ({ queryParams, message }) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.statusCounts),
        variables: {
          kind: queryParams.kind || ''
        }
      },
      {
        query: gql(queries.engageMessageDetail),
        variables: {
          _id: message._id
        }
      }
    ]
  };
};

export default withRouter(
  compose(
    graphql(gql(mutations.messageRemove), {
      name: 'removeMutation',
      options: crudMutationsOptions
    }),
    graphql(gql(mutations.setPause), {
      name: 'setPauseMutation',
      options: statusMutationsOptions
    }),
    graphql(gql(mutations.setLive), {
      name: 'setLiveMutation',
      options: statusMutationsOptions
    }),
    graphql(gql(mutations.setLiveManual), {
      name: 'setLiveManualMutation',
      options: statusMutationsOptions
    })
  )(MessageRowContainer)
);
