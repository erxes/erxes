import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import EngageStats from '../components/EngageStats';
import { queries } from '@erxes/ui-engage/src/graphql';
import { EngageMessageDetailQueryResponse } from '@erxes/ui-engage/src/types';

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
