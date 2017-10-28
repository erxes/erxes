import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { MessageListRow } from '../components';
import { mutations } from '../graphql';

const MessageRowContainer = props => {
  const edit = () => {};
  const remove = () => {};
  const setLive = () => {};
  const setLiveManual = () => {};
  const setPause = () => {};

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
  message: PropTypes.object,
  refetch: PropTypes.func
};

export default compose(
  graphql(gql(mutations.messagesAdd), {
    name: 'messagesAddMutation'
  })
)(MessageRowContainer);
