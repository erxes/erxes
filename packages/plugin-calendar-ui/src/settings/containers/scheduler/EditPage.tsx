import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import {
  EditSchedulePageMutationResponse,
  SchedulePageMutationVariables
} from '../../types';

import PageForm from '../../components/scheduler/PageForm';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries as integrationQueries } from '@erxes/ui-inbox/src/settings/integrations/graphql';
import { mutations } from '../../graphql';
import { queries } from '@erxes/ui-inbox/src/settings/integrations/graphql';

type Props = {
  pageId: string;
  accountId: string;
  history: any;
};

type FinalProps = {
  fetchCalendarQuery: any;
  fetchPageQuery: any;
} & Props &
  EditSchedulePageMutationResponse;

class EditPageContainer extends React.Component<FinalProps, {}> {
  render() {
    const {
      fetchCalendarQuery,
      fetchPageQuery,
      accountId,
      editMutation,
      history,
      pageId
    } = this.props;

    if (fetchCalendarQuery.loading || fetchPageQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (fetchCalendarQuery.error || fetchPageQuery.error) {
      return (
        <span style={{ color: 'red' }}>Integrations api is not running</span>
      );
    }

    const save = (doc: SchedulePageMutationVariables) => {
      editMutation({
        variables: { _id: pageId, ...doc }
      })
        .then(() => {
          Alert.success('You successfully updated a page');

          history.push('/settings/schedule');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      save,
      accountId,
      calendars: fetchCalendarQuery.integrationsNylasGetCalendars || [],
      page: fetchPageQuery.integrationsNylasGetSchedulePage
    };

    return <PageForm {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any>(
      gql(integrationQueries.integrationsNylasGetSchedulePage),
      {
        name: 'fetchPageQuery',
        options: ({ pageId }) => {
          return {
            variables: {
              pageId
            }
          };
        }
      }
    ),
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
      EditSchedulePageMutationResponse
    >(gql(mutations.editSchedulePage), {
      name: 'editMutation'
    })
  )(EditPageContainer)
);
