import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { MessageForm } from '../components';

const MessageFormContainer = props => {
  const { engageMessageDetailQuery, brandsQuery, kind } = props;

  if (engageMessageDetailQuery.loading || brandsQuery.loading) {
    return null;
  }

  const message = engageMessageDetailQuery.engageMessageDetail;
  const brands = brandsQuery.brands;

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
  graphql(
    gql`
      query engageMessageDetail($_id: String) {
        engageMessageDetail(_id: $_id) {
          _id
          kind
        }
      }
    `,
    {
      name: 'engageMessageDetailQuery',
      options: ({ messageId }) => ({
        variables: {
          _id: messageId
        }
      })
    }
  ),
  graphql(
    gql`
      query brands {
        brands {
          _id
          name
        }
      }
    `,
    { name: 'brandsQuery' }
  )
)(MessageFormContainer);
