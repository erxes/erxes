import {
  useMutation,
  useQuery,
  MutationHookOptions,
  QueryHookOptions,
} from '@apollo/client';
import { toast } from 'erxes-ui';
import {
  TEMPLATE_LIST,
  TEMPLATE_DETAIL,
  TEMPLATES_GET_TYPES,
  CATEGORY_LIST,
} from '../graphql/queries';
import {
  ADD_TEMPLATE,
  EDIT_TEMPLATE,
  REMOVE_TEMPLATE,
  USE_TEMPLATE,
} from '../graphql/mutations';
import {
  ITemplate,
  ITemplateListResponse,
  ITemplateDetailResponse,
  ITemplatesGetTypesResponse,
  ICategoryListResponse,
} from '../types/types';

// Query hooks
export const useTemplates = (
  options?: QueryHookOptions<ITemplateListResponse>,
) => {
  const { data, loading, error, refetch, fetchMore } =
    useQuery<ITemplateListResponse>(TEMPLATE_LIST, {
      ...options,
      fetchPolicy: 'cache-and-network',
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
    });

  const templates = data?.templateList?.list || [];
  const totalCount = data?.templateList?.totalCount || 0;
  const pageInfo = data?.templateList?.pageInfo;

  return {
    templates,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    fetchMore,
  };
};

export const useTemplateDetail = (
  options?: QueryHookOptions<ITemplateDetailResponse>,
) => {
  const { data, loading, error } = useQuery<ITemplateDetailResponse>(
    TEMPLATE_DETAIL,
    {
      ...options,
      skip: !options?.variables?._id,
    },
  );

  return {
    template: data?.templateDetail,
    loading,
    error,
  };
};

export const useTemplateTypes = () => {
  const { data, loading, error } =
    useQuery<ITemplatesGetTypesResponse>(TEMPLATES_GET_TYPES);

  return {
    types: data?.templatesGetTypes || [],
    loading,
    error,
  };
};

export const useCategories = (
  options?: QueryHookOptions<ICategoryListResponse>,
) => {
  const { data, loading, error } = useQuery<ICategoryListResponse>(
    CATEGORY_LIST,
    {
      ...options,
    },
  );

  return {
    categories: data?.categoryList?.list || [],
    totalCount: data?.categoryList?.totalCount || 0,
    loading,
    error,
  };
};

// Mutation hooks
export const useTemplateAdd = (options?: MutationHookOptions) => {
  const [addTemplate, { loading, error }] = useMutation(ADD_TEMPLATE, {
    ...options,
    refetchQueries: ['templateList'],
    awaitRefetchQueries: true,
    onCompleted: (data, clientOptions) => {
      toast({
        title: 'Success',
        description: 'Template added successfully',
      });
      options?.onCompleted?.(data, clientOptions);
    },
    onError: (e) => {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  return { addTemplate, loading, error };
};

export const useTemplateEdit = (options?: MutationHookOptions) => {
  const [editTemplate, { loading, error }] = useMutation(EDIT_TEMPLATE, {
    ...options,
    refetchQueries: ['templateList'],
    onCompleted: (data, clientOptions) => {
      toast({
        title: 'Success',
        description: 'Template updated successfully',
      });
      options?.onCompleted?.(data, clientOptions);
    },
    onError: (e) => {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  return { editTemplate, loading, error };
};

export const useTemplateRemove = (options?: MutationHookOptions) => {
  const [removeTemplate, { loading, error }] = useMutation(REMOVE_TEMPLATE, {
    ...options,
    update(cache, { data }) {
      // Remove from cache immediately
      if (data?.templateRemove?._id) {
        cache.evict({
          id: cache.identify({
            __typename: 'Template',
            _id: data.templateRemove._id,
          }),
        });
        cache.gc();
      }
    },
    refetchQueries: ['templateList'],
    awaitRefetchQueries: true,
    onCompleted: (data, clientOptions) => {
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
      options?.onCompleted?.(data, clientOptions);
    },
    onError: (e) => {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  return { removeTemplate, loading, error };
};

export const useTemplateUse = (options?: MutationHookOptions) => {
  const [useTemplate, { loading, error }] = useMutation(USE_TEMPLATE, {
    ...options,
    onCompleted: (data, clientOptions) => {
      toast({
        title: 'Success',
        description: 'Template used successfully',
      });
      options?.onCompleted?.(data, clientOptions);
    },
    onError: (e) => {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  return { useTemplate, loading, error };
};
