import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { EmailStatistics } from '../components';
import { queries } from '../graphql';

const EmailStatisticsContainer = props => {
  const { engageMessageDetailQuery } = props;

  if (engageMessageDetailQuery.loading) {
    return null;
  }

  const message = engageMessageDetailQuery.engageMessageDetail;

  return <EmailStatistics message={message} />;
};

EmailStatisticsContainer.propTypes = {
  engageMessageDetailQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.engageMessageDetail), {
    name: 'engageMessageDetailQuery',
    options: ({ messageId }) => ({
      variables: {
        _id: messageId
      }
    })
  })
)(EmailStatisticsContainer);
