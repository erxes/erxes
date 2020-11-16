import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import Sidebar from '../components/LeftSidebar';

type Props = {
  dateOnChange: (date: string | Date | undefined) => void;
  currentDate: Date;
  typeOnChange: ({ value, label }: { value: string; label: string }) => void;
  type: string;
  accountId: string;
  history: any;
  queryParams: any;
  startTime: Date;
  endTime: Date;
};

type FinalProps = {
  fetchApiQuery: any;
} & Props;

class SidebarContainer extends React.Component<FinalProps> {
  render() {
    const { fetchApiQuery } = this.props;

    if (fetchApiQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (fetchApiQuery.error) {
      return (
        <span style={{ color: 'red' }}>Integrations api is not running</span>
      );
    }

    const updatedProps = {
      ...this.props,
      calendars: fetchApiQuery.integrationsFetchApi || []
    };

    return <Sidebar {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.fetchApi), {
      name: 'fetchApiQuery',
      options: ({ accountId }) => {
        return {
          variables: {
            path: '/nylas/get-calendars',
            params: {
              accountId
            }
          }
        };
      }
    })
  )(SidebarContainer)
);
