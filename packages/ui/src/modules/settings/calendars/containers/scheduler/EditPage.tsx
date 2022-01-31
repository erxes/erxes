import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '../../../integrations/graphql';
import PageForm from '../../components/scheduler/PageForm';
import { mutations } from '../../graphql';

import Spinner from 'modules/common/components/Spinner';
import { Alert, withProps } from 'modules/common/utils';
import { queries as integrationQueries } from '../../../integrations/graphql';
import {
  EditSchedulePageMutationResponse,
  SchedulePageMutationVariables
} from '../../types';

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
      calendars: fetchCalendarQuery.integrationsFetchApi || [],
      page: fetchPageQuery.integrationsFetchApi
    };

    return <PageForm {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(integrationQueries.fetchApi), {
      name: 'fetchPageQuery',
      options: ({ pageId }) => {
        return {
          variables: {
            path: '/nylas/get-schedule-page',
            params: {
              pageId
            }
          }
        };
      }
    }),
    graphql<Props, any>(gql(queries.fetchApi), {
      name: 'fetchCalendarQuery',
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
