import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EngageEmail from 'modules/activityLogs/components/items/email/EngageEmail';
import NylasEmail from 'modules/activityLogs/components/items/email/NylasEmail';
import { EmailDeliveryDetailQueryResponse } from 'modules/activityLogs/types';
import { withProps } from 'modules/common/utils';
import { queries as engageQueries } from 'modules/engage/graphql';
import { EngageMessageDetailQueryResponse } from 'modules/engage/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '../../graphql';

type Props = {
  activity: any;
  emailId: string;
  emailType: string;
};

type FinalProps = {
  engageMessageDetailQuery: EngageMessageDetailQueryResponse;
  emailDeliveryDetailQuery: EmailDeliveryDetailQueryResponse;
} & Props;

class EmailContainer extends React.Component<FinalProps> {
  render() {
    const {
      engageMessageDetailQuery,
      emailDeliveryDetailQuery,
      emailType
    } = this.props;

    if (engageMessageDetailQuery && engageMessageDetailQuery.loading) {
      return null;
    }

    if (emailDeliveryDetailQuery && emailDeliveryDetailQuery.loading) {
      return null;
    }

    if (emailType === 'enage') {
      return (
        <EngageEmail
          {...this.props}
          email={engageMessageDetailQuery.engageMessageDetail}
        />
      );
    }

    return (
      <NylasEmail
        {...this.props}
        email={emailDeliveryDetailQuery.emailDeliveryDetail}
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
        skip: ({ emailType }) => emailType === 'nylas',
        options: ({ emailId }) => ({
          variables: {
            _id: emailId
          }
        })
      }
    ),
    graphql<Props, EngageMessageDetailQueryResponse>(
      gql(queries.emailDeliveryDetail),
      {
        name: 'emailDeliveryDetailQuery',
        skip: ({ emailType }) => emailType === 'engage',
        options: ({ emailId }) => ({
          variables: {
            _id: emailId
          }
        })
      }
    )
  )(EmailContainer)
);
