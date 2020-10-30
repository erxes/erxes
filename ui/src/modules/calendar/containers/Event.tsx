import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import Event from '../components/Event';

type Props = {
  type: string;
  currentDate: Date;
  integrationId: string;
  queryParams: any;
  startTime: Date;
  endTime: Date;
};

type FinalProps = {
  fetchApiQuery: any;
} & Props;

class EventContainer extends React.Component<FinalProps, {}> {
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
      events: fetchApiQuery.integrationsFetchApi || []
    };

    return <Event {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.fetchApi), {
      name: 'fetchApiQuery',
      options: ({ startTime, endTime, queryParams }) => {
        return {
          variables: {
            path: '/nylas/get-events',
            params: {
              ...queryParams,
              startTime,
              endTime
            }
          }
        };
      }
    })
  )(EventContainer)
);
