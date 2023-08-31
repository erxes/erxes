import React from 'react';
import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../../../graphql';
import { MeetingsQueryResponse } from '../../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils/core';
import PreviousDetailComponent from '../../../components/myCalendar/meeting/PreviousDetail';

type Props = {
  companyId: string;
  queryParams: any;
};

type FinalProps = {
  meetingsQuery: MeetingsQueryResponse;
} & Props;

class PreviousDetail extends React.Component<FinalProps> {
  render() {
    const { meetingsQuery, queryParams } = this.props;
    if (meetingsQuery.loading) {
      return <Spinner />;
    }
    const updatedProps = {
      meetings: meetingsQuery.meetings || [],
      queryParams
    };
    return <PreviousDetailComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.meetings), {
      name: 'meetingsQuery',
      options: props => ({
        fetchPolicy: 'network-only',
        variables: {
          companyId: props.companyId,
          isPreviousSession: true
        }
      })
    })
  )(PreviousDetail)
);
