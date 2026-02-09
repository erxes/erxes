import {
  useQuery,
  useMutation,
  QueryHookOptions,
  MutationHookOptions,
} from '@apollo/client';
import { gql } from '@apollo/client';

const CONTRACT_TEMPLATE_FIELDS = `
  id
  name
  description
  htmlContent
  cssContent
  version
  status
  createdAt
  updatedAt
`;

const CONTRACT_TEMPLATES = gql`
  query ContractTemplates {
    contractTemplates {
      ${CONTRACT_TEMPLATE_FIELDS}
    }
  }
`;

const CONTRACT_TEMPLATE = gql`
  query ContractTemplate($id: ID!) {
    contractTemplate(id: $id) {
      ${CONTRACT_TEMPLATE_FIELDS}
    }
  }
`;

const CREATE_CONTRACT_TEMPLATE = gql`
  mutation CreateContractTemplate(
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
      ${CONTRACT_TEMPLATE_FIELDS}
    }
  }
`;

const UPDATE_CONTRACT_TEMPLATE = gql`
  mutation UpdateContractTemplate(
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
      ${CONTRACT_TEMPLATE_FIELDS}
    }
  }
`;

const DELETE_CONTRACT_TEMPLATE = gql`
  mutation DeleteContractTemplate($id: ID!) {
    deleteContractTemplate(id: $id) {
      success
    }
  }
`;

export interface ContractTemplate {
  id: string;
  name: string;
  description?: string;
  htmlContent: string;
  cssContent?: string;
  version: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function useContractTemplates(options?: QueryHookOptions) {
  const { data, loading, error, refetch } = useQuery<{
    contractTemplates: ContractTemplate[];
  }>(CONTRACT_TEMPLATES, options);

  return {
    contractTemplates: data?.contractTemplates || [],
    loading,
    error,
    refetch,
  };
}

export function useContractTemplate(id: string, options?: QueryHookOptions) {
  const { data, loading, error, refetch } = useQuery<{
    contractTemplate: ContractTemplate;
  }>(CONTRACT_TEMPLATE, {
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
    { createContractTemplate: ContractTemplate },
    {
      name: string;
      description?: string;
      htmlContent?: string;
      cssContent?: string;
    }
  >,
) {
  const [createContractTemplate, { loading, error }] = useMutation<
    { createContractTemplate: ContractTemplate },
    {
      name: string;
      description?: string;
      htmlContent?: string;
      cssContent?: string;
    }
  >(CREATE_CONTRACT_TEMPLATE, {
    refetchQueries: ['ContractTemplates'],
    ...options,
  });

  return { createContractTemplate, loading, error };
}

export function useUpdateContractTemplate(
  options?: MutationHookOptions<
    { updateContractTemplate: ContractTemplate },
    {
      id: string;
      name?: string;
      description?: string;
      htmlContent?: string;
      cssContent?: string;
      status?: string;
    }
  >,
) {
  const [updateContractTemplate, { loading, error }] = useMutation<
    { updateContractTemplate: ContractTemplate },
    {
      id: string;
      name?: string;
      description?: string;
      htmlContent?: string;
      cssContent?: string;
      status?: string;
    }
  >(UPDATE_CONTRACT_TEMPLATE, {
    refetchQueries: ['ContractTemplates', 'ContractTemplate'],
    ...options,
  });

  return { updateContractTemplate, loading, error };
}

export function useDeleteContractTemplate(
  options?: MutationHookOptions<
    { deleteContractTemplate: { success: boolean } },
    { id: string }
  >,
) {
  const [deleteContractTemplate, { loading, error }] = useMutation<
    { deleteContractTemplate: { success: boolean } },
    { id: string }
  >(DELETE_CONTRACT_TEMPLATE, {
    refetchQueries: ['ContractTemplates'],
    ...options,
  });

  return { deleteContractTemplate, loading, error };
}
