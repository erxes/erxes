import {
  MutationHookOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client';
import { gql } from '~/gql';
import type {
  InsuranceContractTemplateQuery,
  InsuranceContractTemplateQueryVariables,
  InsuranceContractTemplatesQuery,
  InsuranceContractTemplatesQueryVariables,
  InsuranceCreateContractTemplateMutation,
  InsuranceCreateContractTemplateMutationVariables,
  InsuranceDeleteContractTemplateMutation,
  InsuranceDeleteContractTemplateMutationVariables,
  InsuranceUpdateContractTemplateMutation,
  InsuranceUpdateContractTemplateMutationVariables,
} from '~/gql/graphql';

const CONTRACT_TEMPLATES = gql(`
  query InsuranceContractTemplates {
    contractTemplates {
      id
      name
      description
      htmlContent
      cssContent
      version
      status
      createdAt
      updatedAt
    }
  }
`);

const CONTRACT_TEMPLATE = gql(`
  query InsuranceContractTemplate($id: ID!) {
    contractTemplate(id: $id) {
      id
      name
      description
      htmlContent
      cssContent
      version
      status
      createdAt
      updatedAt
    }
  }
`);

const CREATE_CONTRACT_TEMPLATE = gql(`
  mutation InsuranceCreateContractTemplate(
    $name: String!
    $description: String
    $htmlContent: String
    $cssContent: String
  ) {
    createContractTemplate(
      name: $name
      description: $description
      htmlContent: $htmlContent
      cssContent: $cssContent
    ) {
      id
      name
      description
      htmlContent
      cssContent
      version
      status
      createdAt
      updatedAt
    }
  }
`);

const UPDATE_CONTRACT_TEMPLATE = gql(`
  mutation InsuranceUpdateContractTemplate(
    $id: ID!
    $name: String
    $description: String
    $htmlContent: String
    $cssContent: String
    $status: String
  ) {
    updateContractTemplate(
      id: $id
      name: $name
      description: $description
      htmlContent: $htmlContent
      cssContent: $cssContent
      status: $status
    ) {
      id
      name
      description
      htmlContent
      cssContent
      version
      status
      createdAt
      updatedAt
    }
  }
`);

const DELETE_CONTRACT_TEMPLATE = gql(`
  mutation InsuranceDeleteContractTemplate($id: ID!) {
    deleteContractTemplate(id: $id) {
      success
    }
  }
`);

export type ContractTemplate =
  InsuranceContractTemplatesQuery['contractTemplates'][number];

export function useContractTemplates(
  options?: QueryHookOptions<
    InsuranceContractTemplatesQuery,
    InsuranceContractTemplatesQueryVariables
  >,
) {
  const { data, loading, error, refetch } = useQuery(
    CONTRACT_TEMPLATES,
    options,
  );

  return {
    contractTemplates: data?.contractTemplates || [],
    loading,
    error,
    refetch,
  };
}

export function useContractTemplate(
  id: string,
  options?: QueryHookOptions<
    InsuranceContractTemplateQuery,
    InsuranceContractTemplateQueryVariables
  >,
) {
  const { data, loading, error, refetch } = useQuery(CONTRACT_TEMPLATE, {
    variables: { id },
    skip: !id,
    ...options,
  });

  return {
    contractTemplate: data?.contractTemplate,
    loading,
    error,
    refetch,
  };
}

export function useCreateContractTemplate(
  options?: MutationHookOptions<
    InsuranceCreateContractTemplateMutation,
    InsuranceCreateContractTemplateMutationVariables
  >,
) {
  const [createContractTemplate, { loading, error }] = useMutation(
    CREATE_CONTRACT_TEMPLATE,
    {
      refetchQueries: ['InsuranceContractTemplates'],
      ...options,
    },
  );

  return { createContractTemplate, loading, error };
}

export function useUpdateContractTemplate(
  options?: MutationHookOptions<
    InsuranceUpdateContractTemplateMutation,
    InsuranceUpdateContractTemplateMutationVariables
  >,
) {
  const [updateContractTemplate, { loading, error }] = useMutation(
    UPDATE_CONTRACT_TEMPLATE,
    {
      refetchQueries: [
        'InsuranceContractTemplates',
        'InsuranceContractTemplate',
      ],
      ...options,
    },
  );

  return { updateContractTemplate, loading, error };
}

export function useDeleteContractTemplate(
  options?: MutationHookOptions<
    InsuranceDeleteContractTemplateMutation,
    InsuranceDeleteContractTemplateMutationVariables
  >,
) {
  const [deleteContractTemplate, { loading, error }] = useMutation(
    DELETE_CONTRACT_TEMPLATE,
    {
      refetchQueries: ['InsuranceContractTemplates'],
      ...options,
    },
  );

  return { deleteContractTemplate, loading, error };
}
