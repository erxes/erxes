import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';

import { withProps } from '@erxes/ui/src/utils';
import { queries } from '@erxes/ui-contacts/src/graphql';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import Spinner from '@erxes/ui/src/components/Spinner';
import MergedLog from '../components/MergedLog';

type Props = {
  activity: any;
};

type FinalProps = {
  contactsLogsQuery: any;
} & Props;

class MergedLogContainer extends React.Component<FinalProps> {
  render() {
    const { contactsLogsQuery } = this.props;

    if (contactsLogsQuery.loading) {
      return <Spinner />;
    }

    const contentDetail = contactsLogsQuery.contactsLogs || {};

    const updatedProps = {
      ...this.props,
      contentDetail
    };

    return <MergedLog {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.contactsLogs), {
      name: 'contactsLogsQuery',
      options: ({ activity }) => ({
        variables: {
          action: activity.action,
          content: activity.content,
          contentType: activity.contentType,
          contentId: activity._id
        }
      })
    })
  )(MergedLogContainer)
);
