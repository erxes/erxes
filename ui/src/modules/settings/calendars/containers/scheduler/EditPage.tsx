import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '../../../integrations/graphql';
import PageForm from '../../components/scheduler/PageForm';
import { mutations } from '../../graphql';

import Spinner from 'modules/common/components/Spinner';
import { Alert, withProps } from 'modules/common/utils';
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
  fetchApiQuery: any;
} & Props &
  EditSchedulePageMutationResponse;

class EditPageContainer extends React.Component<FinalProps, {}> {
  render() {
    const { fetchApiQuery, accountId, editMutation, history } = this.props;

    if (fetchApiQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (fetchApiQuery.error) {
      return (
        <span style={{ color: 'red' }}>Integrations api is not running</span>
      );
    }

    const save = (doc: SchedulePageMutationVariables) => {
      editMutation({
        variables: doc
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
      calendars: fetchApiQuery.integrationsFetchApi || []
    };

    return <PageForm {...updatedProps} />;
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
    }),
    graphql<
      Props,
      SchedulePageMutationVariables,
      EditSchedulePageMutationResponse
    >(gql(mutations.createSchedulePage), {
      name: 'editMutation'
    })
  )(EditPageContainer)
);
