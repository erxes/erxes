import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useProjectCustomFieldEdit = () => {
  const { updateProject, loading } = useUpdateProject();
  const { toast } = useToast();
  const { t } = useTranslation('operation');

  return {
    mutate: (variables: { _id: string } & Record<string, unknown>) =>
      updateProject({
        variables,
        onCompleted: () => {
          toast({
            title: t('project-properties-updated', {
              defaultValue: 'Project properties updated',
            }),
            variant: 'success',
          });
        },
      }),
    loading,
  };
};
