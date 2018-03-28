import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { MessageForm } from '../components';
import { queries } from '../graphql';

const MessageFormContainer = props => {
  const { engageMessageDetailQuery, brandsQuery, kind } = props;

  if (engageMessageDetailQuery.loading || brandsQuery.loading) {
    return null;
  }

  const message = engageMessageDetailQuery.engageMessageDetail;
  const brands = brandsQuery.brands || [];

  const updatedProps = {
    ...props,
    kind: message ? message.kind : kind,
    brands
  };

  return <MessageForm {...updatedProps} />;
};

MessageFormContainer.propTypes = {
  kind: PropTypes.string,
  engageMessageDetailQuery: PropTypes.object,
  brandsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.engageMessageDetail), {
    name: 'engageMessageDetailQuery',
    options: ({ messageId }) => ({
      variables: {
        _id: messageId
      }
    })
  }),
  graphql(gql(queries.brands), { name: 'brandsQuery' })
)(MessageFormContainer);
