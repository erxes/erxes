import { TEMPLATES, TEMPLATE_DETAIL } from '@/template/graphql/queries';
import { TTemplate } from '@/template/types';
import { useQuery } from '@apollo/client';

export const useTemplates = () => {
  const { data, loading, error } = useQuery<{ templates: TTemplate[] }>(
    TEMPLATES,
  );

  return { templates: data?.templates || [], loading, error };
};

export const useTemplateDetail = (pluginName?: string, id?: string) => {
  const { data, loading, error } = useQuery<{ templateDetail: TTemplate }>(
    TEMPLATE_DETAIL,
    {
      variables: { pluginName, id },
      skip: !pluginName || !id,
    },
  );

  return { template: data?.templateDetail, loading, error };
};
