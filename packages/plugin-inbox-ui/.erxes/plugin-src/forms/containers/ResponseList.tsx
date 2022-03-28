import gql from "graphql-tag";
import * as compose from "lodash.flowright";
import { IRouterProps } from "@erxes/ui/src/types";
import { withProps } from "@erxes/ui/src/utils";
import { queries } from "@erxes/ui-forms/src/forms/graphql";
import {
  FormSubmissionsQueryResponse,
  FormSubmissionsTotalCountQueryResponse
} from "@erxes/ui-forms/src/forms/types";
import { IntegrationDetailQueryResponse } from "@erxes/ui-inbox/src/settings/integrations/types";
import { LeadIntegrationDetailQueryResponse } from "@erxes/ui-settings/src/integrations/types";
import React from "react";
import { graphql } from "react-apollo";
import ResponseList from "../components/ResponseList";
import { FieldsQueryResponse } from "@erxes/ui-settings/src/properties/types";
import { queries as integrationQueries } from "@erxes/ui-settings/src/integrations/graphql";

type Props = {
  integrationId: string;
  formId: string;
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

    console.log("queryParamsssssss: ", this.props.queryParams);

    const integrationDetail = integrationDetailQuery.integrationDetail || {};

    const formSubmissions = formSubmissionsQuery.formSubmissions || [];

    const fields = fieldsQuery.fields || [];

    const totalCount =
      formSubmissionTotalCountQuery.formSubmissionsTotalCount || 0;

    const updatedProps = {
      ...this.props,
      integrationDetail: integrationDetail as any,
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
        name: "integrationDetailQuery",
        options: ({ queryParams }) => ({
          variables: {
            _id: queryParams.integrationId || ""
          },
          fetchPolicy: "network-only"
        })
      }
    ),
    graphql<Props, FieldsQueryResponse>(gql(queries.fields), {
      name: "fieldsQuery",
      options: ({ queryParams }) => ({
        variables: {
          contentType: "form",
          contentTypeId: queryParams.formId
        }
      })
    }),
    graphql<Props, FormSubmissionsQueryResponse>(gql(queries.formSubmissions), {
      name: "formSubmissionsQuery",
      options: ({ queryParams, formId }) => ({
        variables: {
          formId,
          page: parseInt(queryParams.page || "1", 10),
          perPage: parseInt(queryParams.perPage || "20", 10)
        }
      })
    }),
    graphql<Props, FormSubmissionsTotalCountQueryResponse>(
      gql(queries.formSubmissionTotalCount),
      {
        name: "formSubmissionTotalCountQuery",
        options: ({ integrationId }) => ({
          variables: {
            integrationId
          }
        })
      }
    )
  )(ListContainer)
);
