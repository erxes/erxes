import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { IGroup } from 'modules/settings/calendars/types';
import React from 'react';
import { graphql } from 'react-apollo';
import Wrapper from '../components/Wrapper';
import { queries } from '../graphql';

type Props = {
  currentGroup: IGroup;
  history: any;
  queryParams: any;
};

type FinalProps = {
  calendarsQuery: any;
} & Props;

class SidebarContainer extends React.Component<FinalProps> {
  render() {
    const { calendarsQuery } = this.props;

    if (calendarsQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (calendarsQuery.error) {
      return (
        <span style={{ color: 'red' }}>Integrations api is not running</span>
      );
    }

    const updatedProps = {
      ...this.props,
      accounts: calendarsQuery.calendarAccounts || []
    };

    return <Wrapper {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.calendars), {
      name: 'calendarsQuery',
      options: ({ currentGroup }) => {
        return {
          variables: {
            groupId: currentGroup._id
          }
        };
      }
    })
  )(SidebarContainer)
);
