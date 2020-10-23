import client from 'apolloClient';
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

    const add = ({
      title,
      description,
      start,
      end
    }: {
      title: string;
      end: string;
      start: string;
      description: string;
    }) => {
      client.query({
        query: gql(queries.fetchApi),
        fetchPolicy: 'network-only',
        variables: {
          path: '/nylas/create-calendar-event',
          params: {
            erxesApiId: 'Ktweaku7bddymm8wJ',
            title,
            calendarId: 'qwtn6h7tl37ns3yoqquwld04',
            start,
            end,
            description
          }
        }
      });
    };

    const updatedProps = {
      ...this.props,
      add,
      events: fetchApiQuery.integrationsFetchApi || []
    };

    return <Event {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.fetchApi), {
      name: 'fetchApiQuery',
      options: ({ currentDate, type }) => {
        let startTime = new Date();
        let endTime = new Date();

        if (type === 'month') {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();

          startTime = new Date(year, month, 1);
          endTime = new Date(year, month + 1, 0);
        }

        return {
          variables: {
            path: '/nylas/get-events',
            params: {
              calendarId: 'qwtn6h7tl37ns3yoqquwld04',
              startTime,
              endTime
            }
          }
        };
      }
    })
  )(EventContainer)
);
