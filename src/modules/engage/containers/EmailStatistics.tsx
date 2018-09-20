import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { EmailStatistics } from '../components';
import { queries } from '../graphql';

type Props = {
  engageMessageDetailQuery: any
};

const EmailStatisticsContainer = (props : Props) => {
  const { engageMessageDetailQuery } = props;

  if (engageMessageDetailQuery.loading) {
    return null;
  }

  const message = engageMessageDetailQuery.engageMessageDetail;

  return <EmailStatistics message={message} {...props} />;
};

export default compose(
  graphql(gql(queries.engageMessageDetail), {
    name: 'engageMessageDetailQuery',
    options: ({ messageId } : { messageId: string }) => ({
      variables: {
        _id: messageId
      }
    })
  })
)(EmailStatisticsContainer);
