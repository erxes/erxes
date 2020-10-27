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
        erxesApiId: 'Ktweaku7bddymm8wJ',
        calendarId: 'qwtn6h7tl37ns3yoqquwld04'
      };

      return (
        <ButtonMutate
          mutation={mutations.createEvent}
          variables={variables}
          callback={callBackResponse}
          refetchQueries={['fetchApiQuery']}
          isSubmitted={isSubmitted}
          btnSize="small"
          type="submit"
          icon="check-1"
        />
      );
    };

    const monthEvents = fetchApiQuery.integrationsFetchApi || [];

    const updatedProps = {
      ...this.props,
      events: monthEvents,
      renderButton
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
