import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  AUTOMATION_EMAIL_TEMPLATES_ADD,
  AUTOMATION_EMAIL_TEMPLATES_EDIT,
  AUTOMATION_EMAIL_TEMPLATES_REMOVE,
} from '@/automations/components/settings/components/email-templates/graphql/mutations';
import { AUTOMATION_EMAIL_TEMPLATES } from '@/automations/components/settings/components/email-templates/graphql/queries';
import {
  ICreateAutomationEmailTemplateInput,
  IUpdateAutomationEmailTemplateInput,
} from '@/automations/components/settings/components/email-templates/types/automationEmailTemplates';

export function useCreateAutomationEmailTemplate() {
  const { toast } = useToast();
  const { t } = useTranslation('automations');
  const [createEmailTemplate, { loading }] = useMutation(
    AUTOMATION_EMAIL_TEMPLATES_ADD,
    {
      refetchQueries: [AUTOMATION_EMAIL_TEMPLATES],
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('email-template-created', 'Email template created successfully'),
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  );

  const handleCreate = async (input: ICreateAutomationEmailTemplateInput) => {
    return createEmailTemplate({
      variables: input,
    });
  };

  return {
    createEmailTemplate: handleCreate,
    loading,
  };
}

export function useUpdateAutomationEmailTemplate() {
  const { toast } = useToast();
  const { t } = useTranslation('automations');
  const [updateEmailTemplate, { loading }] = useMutation(
    AUTOMATION_EMAIL_TEMPLATES_EDIT,
    {
      refetchQueries: [AUTOMATION_EMAIL_TEMPLATES],
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('email-template-updated', 'Email template updated successfully'),
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  );

  const handleUpdate = async (input: IUpdateAutomationEmailTemplateInput) => {
    return updateEmailTemplate({
      variables: input,
    });
  };

  return {
    updateEmailTemplate: handleUpdate,
    loading,
  };
}

export function useRemoveAutomationEmailTemplate() {
  const { toast } = useToast();
  const { t } = useTranslation('automations');
  const [removeEmailTemplate, { loading }] = useMutation(
    AUTOMATION_EMAIL_TEMPLATES_REMOVE,
    {
      refetchQueries: [AUTOMATION_EMAIL_TEMPLATES],
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('email-template-removed', 'Email template removed successfully'),
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  );

  const handleRemove = async (id: string) => {
    return removeEmailTemplate({
      variables: { _id: id },
    });
  };

  return {
    removeEmailTemplate: handleRemove,
    loading,
  };
}
