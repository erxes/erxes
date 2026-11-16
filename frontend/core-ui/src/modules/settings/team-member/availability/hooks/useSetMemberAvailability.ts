import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { USERS_SET_AVAILABILITY } from '../graphql/availability';
import { TAvailabilityStatus } from '../types';

export type TSetMemberAvailabilityInput = {
  _id: string;
  status: TAvailabilityStatus | null;
  until?: string | null;
  reason?: string | null;
};

export const useSetMemberAvailability = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [mutate, { loading }] = useMutation(USERS_SET_AVAILABILITY);

  // The mutation returns the member's availability, which updates every list
  // and detail reading it from the cache.
  const setAvailability = (
    input: TSetMemberAvailabilityInput,
    onDone?: () => void,
  ) =>
    mutate({
      variables: input,
      onCompleted: () => {
        toast({ title: t('availability-saved', 'Availability saved') });
        onDone?.();
      },
      onError: (error) =>
        toast({ title: error.message, variant: 'destructive' }),
    });

  return { setAvailability, loading };
};
