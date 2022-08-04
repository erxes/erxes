import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '@erxes/ui-settings/src/integrations/graphql';
import PageForm from '../../components/scheduler/PageForm';
import { mutations } from '../../graphql';

import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { queries as integrationQueries } from '@erxes/ui-settings/src/integrations/graphql';
import {
  CreateSchedulePageMutationResponse,
  SchedulePageMutationVariables
} from '../../types';

type Props = {
  accountId: string;
  history: any;
};

type FinalProps = {
  fetchCalendarQuery: any;
} & Props &
  CreateSchedulePageMutationResponse;

class FormContainer extends React.Component<FinalProps, {}> {
  render() {
    const { fetchCalendarQuery, accountId, createMutation, history } = this.props;

    if (fetchCalendarQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (fetchCalendarQuery.error) {
      return (
        <span style={{ color: 'red' }}>Integrations api is not running</span>
      );
    }

    const save = (doc: SchedulePageMutationVariables) => {
      createMutation({
        variables: doc,
        refetchQueries: getRefetchQueries(accountId)
      })
        .then(() => {
          Alert.success('You successfully created a page');
          history.push('/settings/schedule');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      save,
      accountId,
      calendars: fetchCalendarQuery.integrationsNylasGetCalendars || []
    };

    return <PageForm {...updatedProps} />;
  }
}

const getRefetchQueries = (accountId: string) => {
  return [
    {
      query: gql(integrationQueries.integrationsNylasGetSchedulePages),
      variables: {
        accountId 
      }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.integrationsNylasGetCalendars), {
      name: 'fetchCalendarQuery',
      options: ({ accountId }) => {
        return {
          variables: {
            accountId
          }
        };
      }
    }),
    graphql<
      Props,
      SchedulePageMutationVariables,
      CreateSchedulePageMutationResponse
    >(gql(mutations.createSchedulePage), {
      name: 'createMutation'
    })
  )(FormContainer)
);
