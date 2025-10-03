import { useMutation } from '@apollo/client';
import { currentOrganizationState } from 'ui-modules';

import { useToast } from 'erxes-ui';

import { CreateOwner } from '@/organization/owner/graphql/mutation/createOwner';
import { CreateOwnerFormType } from '@/organization/owner/hooks/useCreateOwnerForm';
import { useAtom } from 'jotai';

export const useCreateOwner = () => {
  const { toast } = useToast();

  const [createOwnerMutation] = useMutation(CreateOwner);
  const [currentOrganization, setCurrentOrganization] = useAtom(
    currentOrganizationState,
  );

  const createOwner = async (input: CreateOwnerFormType) => {
    await createOwnerMutation({ variables: input })
      .then(() => {
        toast({
          title: 'Success',
          description: 'Owner has been created successfully',
        });

        if (currentOrganization) {
          setCurrentOrganization({ ...currentOrganization, hasOwner: true });
        }
      })
      .catch((e) => {
        toast({
          title: 'Uh oh! Something went wrong.',
          description: e.message,
        });
      });
  };

  return { createOwner };
};
