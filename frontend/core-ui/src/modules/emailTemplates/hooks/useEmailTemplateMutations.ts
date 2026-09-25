import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import {
  EMAIL_TEMPLATE_ADD,
  EMAIL_TEMPLATE_EDIT,
  EMAIL_TEMPLATE_REMOVE,
} from '@/emailTemplates/graphql/mutations';
import { EMAIL_TEMPLATES } from '@/emailTemplates/graphql/queries';

/** Every write refetches the list, so a saved template shows up at once. */
export const useEmailTemplateMutations = () => {
  const { toast } = useToast();

  const onError = (error: Error) =>
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });

  const options = { refetchQueries: [EMAIL_TEMPLATES], onError };

  const [addEmailTemplate, { loading: adding }] = useMutation(
    EMAIL_TEMPLATE_ADD,
    options,
  );
  const [editEmailTemplate, { loading: editing }] = useMutation(
    EMAIL_TEMPLATE_EDIT,
    options,
  );
  const [removeEmailTemplate, { loading: removing }] = useMutation(
    EMAIL_TEMPLATE_REMOVE,
    options,
  );

  return {
    addEmailTemplate,
    editEmailTemplate,
    removeEmailTemplate,
    loading: adding || editing || removing,
  };
};
