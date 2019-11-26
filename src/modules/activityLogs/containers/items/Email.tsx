import gql from 'graphql-tag';
import Email from 'modules/activityLogs/components/items/Email';
// import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/engage/graphql';
import { EmailDeliveryDetailQueryResponse } from 'modules/engage/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  activity: any;
  emailId: string;
};

type FinalProps = {
  emailDeliveryDetailQuery: EmailDeliveryDetailQueryResponse;
} & Props;

class EmailContainer extends React.Component<FinalProps> {
  render() {
    const { emailDeliveryDetailQuery } = this.props;

    if (emailDeliveryDetailQuery.loading) {
      return null;
    }

    const email = emailDeliveryDetailQuery.emailDeliveryDetail;

    const updatedProps = {
      ...this.props,
      email
    };

    return <Email {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, EmailDeliveryDetailQueryResponse>(
      gql(queries.emailDeliveryDetail),
      {
        name: 'emailDeliveryDetailQuery',
        options: ({ emailId }) => ({
          variables: {
            _id: emailId
          }
        })
      }
    )
  )(EmailContainer)
);
