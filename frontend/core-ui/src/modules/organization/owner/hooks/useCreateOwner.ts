import { useMutation } from '@apollo/client';
import { currentOrganizationState } from 'ui-modules';

import { useToast } from 'erxes-ui';

import { CreateOwner } from '@/organization/owner/graphql/mutation/createOwner';
import { CreateOwnerFormType } from '@/organization/owner/hooks/useCreateOwnerForm';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const useCreateOwner = () => {
  const { toast } = useToast();
  const { t } = useTranslation('organization', { keyPrefix: 'create-owner' });

  const [createOwnerMutation] = useMutation(CreateOwner);
  const [currentOrganization, setCurrentOrganization] = useAtom(
    currentOrganizationState,
  );

  const createOwner = async (input: CreateOwnerFormType) => {
    await createOwnerMutation({ variables: input })
      .then(() => {
        toast({
          title: t('success'),
          description: t('owner-created'),
          variant: 'success',
        });

        if (currentOrganization) {
          setCurrentOrganization({ ...currentOrganization, hasOwner: true });
        }
      })
      .catch((e) => {
        toast({
          title: t('something-went-wrong'),
          description: e.message,
          variant: 'destructive',
        });
      });
  };

  return { createOwner };
};
