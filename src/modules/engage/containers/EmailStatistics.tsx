import gql from 'graphql-tag';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import { EmailStatistics } from '../components';
import { queries } from '../graphql';
import { EngageMessageDetailQueryResponse } from '../types';

type Props = {
  messageId: string;
};

type FinalProps = {
  engageMessageDetailQuery: EngageMessageDetailQueryResponse;
};

const EmailStatisticsContainer = (props: FinalProps) => {
  const { engageMessageDetailQuery } = props;

  if (engageMessageDetailQuery.loading) {
    return null;
  }

  const message = engageMessageDetailQuery.engageMessageDetail;

  return <EmailStatistics message={message} {...props} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, EngageMessageDetailQueryResponse, { _id: string }>(
      gql(queries.engageMessageDetail),
      {
        name: 'engageMessageDetailQuery',
        options: ({ messageId }) => ({
          variables: {
            _id: messageId
          }
        })
      }
    )
  )(EmailStatisticsContainer)
);
