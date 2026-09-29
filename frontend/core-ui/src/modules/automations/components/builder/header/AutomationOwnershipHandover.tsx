import { useAutomationOwnershipRequest } from '@/automations/hooks/useAutomationOwnershipRequest';
import { useApolloClient } from '@apollo/client';
import { IconHourglass, IconSend } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApprovalNotificationActions, IUser, SelectMember } from 'ui-modules';
import { GET_USER_INLINE_DETAIL } from 'ui-modules/modules/team-members/graphql/queries/userQueries';

const nameOf = (user?: IUser) =>
  user?.details?.fullName || user?.email || 'Unknown';

/**
 * Handing the automation over is an offer, so this only asks. The change lands
 * when the other person approves it — nobody is made to answer for records
 * they never agreed to.
 */
export const AutomationOwnershipHandover = ({
  automationId,
  automationName,
}: {
  automationId?: string;
  automationName?: string;
}) => {
  const { t } = useTranslation('automations');
  const client = useApolloClient();
  const [picking, setPicking] = useState(false);
  const { pending, submitting, offerOwnership, refetch } =
    useAutomationOwnershipRequest(automationId);

  if (pending) {
    return (
      <div className="flex flex-col gap-2 rounded border border-warning/40 bg-warning/5 p-2">
        {/* Who it went to is in the summary below, so naming the current
            owner here only made it read like they were the one deciding. */}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <IconHourglass className="size-3.5" />
          {t('ownership-waiting')}
        </p>
        <p className="text-sm">{pending.change?.summary}</p>
        <ApprovalNotificationActions
          request={pending}
          onCompleted={() => refetch()}
        />
      </div>
    );
  }

  if (!picking) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="justify-start px-0"
        onClick={() => setPicking(true)}
      >
        <IconSend className="size-3.5" />
        {t('ownership-hand-over')}
      </Button>
    );
  }

  // The offer is read away from this screen, so it names both the automation
  // and the person instead of pointing at "this one".
  const handlePick = async (memberId: string) => {
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
  };

  return (
    <div className="flex flex-col gap-2 rounded border p-2">
      <p className="text-xs text-muted-foreground">
        {t('ownership-hand-over-description')}
      </p>
      <div className="rounded border">
        <SelectMember.Provider
          mode="single"
          onValueChange={async (value) => {
            const memberId = Array.isArray(value) ? value[0] : value;

            if (!memberId) {
              return;
            }

            setPicking(false);
            await handlePick(memberId);
          }}
        >
          <SelectMember.Content />
        </SelectMember.Provider>
      </div>
      {submitting && <Spinner />}
      <Button variant="ghost" size="sm" onClick={() => setPicking(false)}>
        {t('cancel')}
      </Button>
    </div>
  );
};
