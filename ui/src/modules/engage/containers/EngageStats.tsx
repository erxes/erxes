import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import EngageStats from '../components/EngageStats';
import { queries } from '../graphql';
import { EngageMessageDetailQueryResponse } from '../types';

type Props = {
  messageId: string;
};

type FinalProps = {
  engageMessageDetailQuery: EngageMessageDetailQueryResponse;
};

const EngageStatsContainer = (props: FinalProps) => {
  const { engageMessageDetailQuery } = props;

  if (engageMessageDetailQuery.error) {
    return <EmptyState size="full" text="Error" icon="ban" />;
  }

  if (engageMessageDetailQuery.loading) {
    return <Spinner />;
  }

  if (!engageMessageDetailQuery.engageMessageDetail) {
    return (
      <EmptyState size="full" text="Message not found" icon="web-section-alt" />
    );
  }

  const message = engageMessageDetailQuery.engageMessageDetail;

  return <EngageStats message={message} {...props} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, EngageMessageDetailQueryResponse, { _id: string }>(
      gql(queries.engageMessageStats),
      {
        name: 'engageMessageDetailQuery',
        options: ({ messageId }) => ({
          variables: {
            _id: messageId
          }
        })
      }
    )
  )(EngageStatsContainer)
);
