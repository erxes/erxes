import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Email from 'modules/activityLogs/components/items/Email';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/engage/graphql';
import { EngageMessageDetailQueryResponse } from 'modules/engage/types';
import React from 'react';
import { graphql } from 'react-apollo';

type Props = {
  activity: any;
  emailId: string;
};

type FinalProps = {
  engageMessageDetailQuery: EngageMessageDetailQueryResponse;
} & Props;

class EmailContainer extends React.Component<FinalProps> {
  render() {
    const { engageMessageDetailQuery } = this.props;

    if (engageMessageDetailQuery.loading) {
      return null;
    }

    const engageMessage = engageMessageDetailQuery.engageMessageDetail;

    const updatedProps = {
      ...this.props,
      engageMessage
    };

    return <Email {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, EngageMessageDetailQueryResponse>(
      gql(queries.engageMessageDetail),
      {
        name: 'engageMessageDetailQuery',
        options: ({ emailId }) => ({
          variables: {
            _id: emailId
          }
        })
      }
    )
  )(EmailContainer)
);
