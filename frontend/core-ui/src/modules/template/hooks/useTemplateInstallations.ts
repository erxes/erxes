import {
  TEMPLATE_INSTALLATIONS,
  TEMPLATE_INSTALLATION_DETAIL,
} from '@/template/graphql/queries';
import { TEMPLATE_INSTALLATION_REMOVE } from '@/template/graphql/mutations';
import { TTemplateInstallation } from '@/template/types';
import { useMutation, useQuery } from '@apollo/client';
import { useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export const useTemplateInstallations = () => {
  const { data, loading, error } = useQuery<{
    templateInstallations: TTemplateInstallation[];
  }>(TEMPLATE_INSTALLATIONS);

  return { installations: data?.templateInstallations || [], loading, error };
};

export const useTemplateInstallationDetail = (_id?: string) => {
  const { data, loading, error } = useQuery<{
    templateInstallationDetail: TTemplateInstallation;
  }>(TEMPLATE_INSTALLATION_DETAIL, {
    variables: { _id },
    skip: !_id,
    fetchPolicy: 'cache-and-network',
  });

  return { installation: data?.templateInstallationDetail, loading, error };
};

// Removing takes the installation's automations and agent with it
export const useRemoveTemplateInstallation = () => {
  const { t } = useTranslation('templates');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [remove, { loading }] = useMutation(TEMPLATE_INSTALLATION_REMOVE, {
    refetchQueries: [{ query: TEMPLATE_INSTALLATIONS }],
    awaitRefetchQueries: true,
  });

  const removeInstallation = (installation: TTemplateInstallation) =>
    confirm({
      message: t('remove-confirm', { name: installation.name }),
      options: { confirmationValue: 'delete' },
    }).then(() =>
      remove({ variables: { _id: installation._id } })
        .then(() => {
          toast({ variant: 'success', title: t('removed') });
          navigate('/templates?tab=installed');
        })
        .catch((error: Error) =>
          toast({
            variant: 'destructive',
            title: t('remove-failed'),
            description: error.message,
          }),
        ),
    );

  return { removeInstallation, loading };
};
