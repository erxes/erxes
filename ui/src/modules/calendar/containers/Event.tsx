import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import Event from '../components/Event';
import { mutations } from '../graphql';

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
    const {
      fetchApiQuery,
      queryParams,
      integrationId,
      startTime,
      endTime
    } = this.props;

    if (fetchApiQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (fetchApiQuery.error) {
      return (
        <span style={{ color: 'red' }}>Integrations api is not running</span>
      );
    }

    const refetchQuery = {
      query: gql(queries.fetchApi),
      variables: {
        path: '/nylas/get-events',
        params: { ...queryParams, startTime, endTime }
      }
    };

    const renderButton = ({
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      const callBackResponse = () => {
        if (callback) {
          callback();
        }
      };

      const variables = {
        ...values,
        erxesApiId: integrationId,
        calendarId: 'qwtn6h7tl37ns3yoqquwld04'
      };

      return (
        <ButtonMutate
          mutation={mutations.createEvent}
          variables={variables}
          callback={callBackResponse}
          refetchQueries={[refetchQuery]}
          isSubmitted={isSubmitted}
          btnSize="small"
          type="submit"
          icon="check-1"
        />
      );
    };

    const updatedProps = {
      ...this.props,
      events: fetchApiQuery.integrationsFetchApi || [],
      renderButton
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
