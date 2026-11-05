import { useTranslation } from 'react-i18next';
import {
  MutationFunctionOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client';
import { toast, useConfirm } from 'erxes-ui';

import { GET_USER_DETAIL } from '@/settings/profile/graphql/queries/userDetail';
import { UPDATE_PROFILE } from '@/settings/profile/graphql/mutations/updateProfile';
import { currentUserState, IUser } from 'ui-modules';
import { useAtom } from 'jotai';
import type { FormType, ProfilePatch } from './useProfileForm';
import { useRef } from 'react';

type Profile = IUser & {
  details?: IUser['details'] & FormType['details'];
  links?: FormType['links'];
  positionIds?: string[];
};

const useProfile = (
  options?: QueryHookOptions<{ userDetail: Profile }, { _id?: string }>,
) => {
  const [currentUser, setCurrentUser] = useAtom(currentUserState);
  const savingRef = useRef(false);

  const { confirm } = useConfirm();
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  const { loading, data } = useQuery<{ userDetail: Profile }, { _id?: string }>(
    GET_USER_DETAIL,
    {
      variables: { _id: currentUser?._id },
      ...options,
      skip: !currentUser?._id,
    },
  );

  const [updateProfile, { loading: updating }] = useMutation<
    { usersEditProfilePatch: Profile },
    ProfilePatch
  >(UPDATE_PROFILE);

  const profileUpdate = ({
    variables,
    onStart,
    ...options
  }: MutationFunctionOptions<
    { usersEditProfilePatch: Profile },
    ProfilePatch
  > & { onStart?: () => void }) => {
    if (savingRef.current) return Promise.resolve();
    const confirmOptions = { confirmationValue: 'update' };

    return confirm({
      message: t('confirm-update-profile'),
      options: confirmOptions,
    })
      .then(async () => {
        if (savingRef.current) return;
        savingRef.current = true;
        try {
          onStart?.();
          await updateProfile({
            ...options,
            variables,
            onCompleted: ({ usersEditProfilePatch }) => {
              setCurrentUser(
                (prev) =>
                  prev && {
                    ...prev,
                    ...usersEditProfilePatch,
                  },
              );
              options.onCompleted?.({ usersEditProfilePatch });

              toast({
                title: t('profile-updated-successfully'),
                variant: 'success',
              });
            },
            onError: (error) => {
              options.onError?.(error);
              toast({
                title: t('error-updating-profile'),
                description: error.message || t('unexpected-error'),
                variant: 'destructive',
              });
            },
          });
        } finally {
          savingRef.current = false;
        }
      })
      .catch(() => undefined);
  };

  const profile = data?.userDetail;

  return {
    profile,
    loading,
    profileUpdate,
    updating,
  };
};

export { useProfile };
