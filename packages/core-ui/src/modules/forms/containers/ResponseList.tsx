import { gql, useQuery } from '@apollo/client';
import { queries } from '@erxes/ui-forms/src/forms/graphql';
import {
  FormSubmissionsQueryResponse,
  FormSubmissionsTotalCountQueryResponse,
} from '@erxes/ui-forms/src/forms/types';
import { FieldsQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import { IRouterProps } from '@erxes/ui/src/types';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import ResponseList from '../components/ResponseList';

type Props = {
  queryParams: any;
  formId: string;
} & IRouterProps;

const ListContainer: React.FC<Props> = ({ queryParams, formId, ...routerProps }) => {
  const { data: fieldsData } = useQuery<FieldsQueryResponse>(
    gql(queries.fields),
    {
      variables: {
        contentType: 'form',
        contentTypeId: formId,
      },
    }
  );

  const { data: formSubmissionsData, loading } =
    useQuery<FormSubmissionsQueryResponse>(gql(queries.formSubmissions), {
      variables: {
        ...generatePaginationParams(queryParams),
        formId,
      },
      fetchPolicy: 'network-only',
    });

  const { data: formSubmissionTotalCountData } =
    useQuery<FormSubmissionsTotalCountQueryResponse>(
      gql(queries.formSubmissionTotalCount),
      {
        variables: { formId },
      }
    );

  const formSubmissions = formSubmissionsData?.formSubmissions || [];
  const fields = fieldsData?.fields || [];
  const totalCount =
    formSubmissionTotalCountData?.formSubmissionsTotalCount || 0;

  const updatedProps = {
    ...routerProps,
    queryParams,
    formId,
    formSubmissions,
    loading,
    totalCount,
    fields,
  };

  return <ResponseList {...updatedProps} />;
};

export default ListContainer;
