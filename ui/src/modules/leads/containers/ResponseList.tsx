import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/forms/graphql';
import {
  FormSubmissionsQueryResponse,
  FormSubmissionsTotalCountQueryResponse
} from 'modules/forms/types';
import {
  IntegrationDetailQueryResponse,
  LeadIntegrationDetailQueryResponse
} from 'modules/settings/integrations/types';
import React from 'react';
import { graphql } from 'react-apollo';
import ResponseList from '../components/ResponseList';
import { FieldsQueryResponse } from 'modules/settings/properties/types';
import { queries as integrationQueries } from 'modules/settings/integrations/graphql';
type Props = {
  queryParams: any;
};

type FinalProps = {
  integrationDetailQuery: LeadIntegrationDetailQueryResponse;
  formSubmissionsQuery: FormSubmissionsQueryResponse;
  fieldsQuery: FieldsQueryResponse;
  formSubmissionTotalCountQuery: FormSubmissionsTotalCountQueryResponse;
} & IRouterProps &
  Props;

class ListContainer extends React.Component<FinalProps> {
  render() {
    const {
      integrationDetailQuery,
      formSubmissionsQuery,
      fieldsQuery,
      formSubmissionTotalCountQuery
    } = this.props;

    const integrationDetail = integrationDetailQuery.integrationDetail || {};

    const formSubmissions = formSubmissionsQuery.formSubmissions || [];

    const fields = fieldsQuery.fields || [];

    const totalCount =
      formSubmissionTotalCountQuery.formSubmissionsTotalCount || 0;

    const updatedProps = {
      ...this.props,
      integrationDetail,
      formSubmissions,
      loading: integrationDetailQuery.loading,
      totalCount,
      fields
    };

    return <ResponseList {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, IntegrationDetailQueryResponse>(
      gql(integrationQueries.integrationDetail),
      {
        name: 'integrationDetailQuery',
        options: ({ queryParams }) => ({
          variables: {
            _id: queryParams.integrationId || ''
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, FieldsQueryResponse>(gql(queries.fields), {
      name: 'fieldsQuery',
      options: ({ queryParams }) => ({
        variables: {
          contentType: 'form',
          contentTypeId: queryParams.formId
        }
      })
    }),
    graphql<Props, FormSubmissionsQueryResponse>(gql(queries.formSubmissions), {
      name: 'formSubmissionsQuery',
      options: ({ queryParams }) => ({
        variables: {
          formId: queryParams.formid
        }
      })
    }),
    graphql<Props, FormSubmissionsTotalCountQueryResponse>(
      gql(queries.formSubmissionTotalCount),
      {
        name: 'formSubmissionTotalCountQuery',
        options: ({ queryParams }) => ({
          variables: {
            integrationId: queryParams.integrationId
          }
        })
      }
    )
  )(ListContainer)
);
