import { useAutomationOwnershipRequest } from '@/automations/hooks/useAutomationOwnershipRequest';
import { useApolloClient } from '@apollo/client';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IUser } from 'ui-modules';
import { GET_USER_INLINE_DETAIL } from 'ui-modules/modules/team-members/graphql/queries/userQueries';

const nameOf = (user?: IUser) =>
  user?.details?.fullName || user?.email || 'Unknown';

const firstValue = (value: string | string[] | null) =>
  Array.isArray(value) ? value[0] : value;

/**
 * Offering the automation to another member. The offer is read away from this
 * screen, so its summary names both the automation and the person.
 */
export const useAutomationOwnershipHandover = (
  automationId?: string,
  automationName?: string,
) => {
  const { t } = useTranslation('automations');
  const client = useApolloClient();
  const [picking, setPicking] = useState(false);
  const { pending, submitting, offerOwnership, refetch } =
    useAutomationOwnershipRequest(automationId);

  const offerTo = useCallback(
    async (memberId: string) => {
      const { data } = await client.query<{ userDetail?: IUser }>({
        query: GET_USER_INLINE_DETAIL,
        variables: { _id: memberId },
      });

      await offerOwnership(
        memberId,
        t('ownership-offer-summary', {
          automation: automationName,
          person: nameOf(data?.userDetail),
        }),
      );
    },
    [client, offerOwnership, t, automationName],
  );

  const onMemberPicked = useCallback(
    async (value: string | string[] | null) => {
      const memberId = firstValue(value);

      if (!memberId) {
        return;
      }

      setPicking(false);
      await offerTo(memberId);
    },
    [offerTo],
  );

  return {
    pending,
    submitting,
    picking,
    startPicking: () => setPicking(true),
    cancelPicking: () => setPicking(false),
    onMemberPicked,
    onRequestCompleted: () => refetch(),
  };
};
