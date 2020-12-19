import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EngageSms from 'modules/activityLogs/components/items/EngageSms';
import { IActivityLog } from 'modules/activityLogs/types';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { queries as engageQueries } from 'modules/engage/graphql';
import { EngageMessageDetailQueryResponse } from 'modules/engage/types';
import React from 'react';
import { graphql } from 'react-apollo';

type Props = {
  activity: IActivityLog;
  engageId: string;
};

type FinalProps = {
  engageMessageDetailQuery: EngageMessageDetailQueryResponse;
} & Props;

class EngageSmsContainer extends React.Component<FinalProps> {
  render() {
    const { engageMessageDetailQuery } = this.props;

    if (engageMessageDetailQuery.loading) {
      return <Spinner />;
    }

    return (
      <EngageSms
        {...this.props}
        engageSms={engageMessageDetailQuery.engageMessageDetail}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, EngageMessageDetailQueryResponse>(
      gql(engageQueries.engageMessageDetail),
      {
        name: 'engageMessageDetailQuery',
        options: ({ engageId }) => ({
          variables: {
            _id: engageId
          }
        })
      }
    )
  )(EngageSmsContainer)
);
