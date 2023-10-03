import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import List from '../../components/deal/meetingList';
import { MeetingsQueryResponse } from '../../types';
import { queries } from '../../graphql';
import React from 'react';

import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  dealId: string;
};

type FinalProps = {
  meetingQuery: MeetingsQueryResponse;
} & Props;

const ListContainer = (props: FinalProps) => {
  const { meetingQuery, dealId } = props;
  if (meetingQuery.loading) {
    return <Spinner />;
  }
  const updatedProps = {
    meetings: meetingQuery.meetings || [],
    dealId
  };
  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.meetings), {
      name: 'meetingQuery',
      options: ({ dealId }: Props) => {
        return {
          variables: {
            dealIds: [dealId]
          }
        };
      },
      skip: props => !props.dealId
    })
  )(ListContainer)
);
