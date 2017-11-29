import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { MessageListRow } from '../components';
import { mutations } from '../graphql';
import { confirm } from 'modules/common/utils';

const MessageRowContainer = props => {
  const {
    history,
    message,
    refetch,
    removeMutation,
    setPauseMutation,
    setLiveMutation,
    setLiveManualMutation
  } = props;

  const doMutation = mutation => {
    mutation({
      variables: { _id: message._id }
    })
      .then(() => {
        refetch();

        Alert.success('Congrats');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const edit = () => {
    history.push(`/engage/messages/edit/${message._id}`);
  };

  const remove = () => {
    confirm().then(() => {
      doMutation(removeMutation);
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
  refetch: PropTypes.func,
  removeMutation: PropTypes.func,
  setPauseMutation: PropTypes.func,
  setLiveMutation: PropTypes.func,
  setLiveManualMutation: PropTypes.func
};

export default withRouter(
  compose(
    graphql(gql(mutations.messageRemove), {
      name: 'removeMutation'
    }),
    graphql(gql(mutations.setPause), {
      name: 'setPauseMutation'
    }),
    graphql(gql(mutations.setLive), {
      name: 'setLiveMutation'
    }),
    graphql(gql(mutations.setLiveManual), {
      name: 'setLiveManualMutation'
    })
  )(MessageRowContainer)
);
