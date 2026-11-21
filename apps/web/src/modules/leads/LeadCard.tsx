import type { LeadRecordType } from '@erxes/core-contract';
import { IconClockHour4, IconMail, IconPhone } from '@tabler/icons-react';
import { memberQueries } from '@erxes/core-contract/client';
import {
  Avatar,
  Board,
  cn,
  companyTitle,
  customerTitle,
  memberName,
  readImage,
  Tooltip,
  useMembersById,
} from 'erxes-ui';
import { memo } from 'react';
import { useMinuteClock } from '~/lib/useMinuteClock';
import { useOpenPanelRecord } from '~/modules/side-panel/useSidePanel';
import { useLeadsT } from './i18n';
import type { BoardLead } from './useBoardMove';
import { daysSince } from './useLeads';

const nameOf = (lead: BoardLead) =>
  ('primaryName' in lead ? companyTitle(lead) : customerTitle(lead)) || '';

/** The owner as an avatar; their name on hover. */
const OwnerAvatar = ({ ownerId }: { ownerId: string }) => {
  const t = useLeadsT();
  const member = useMembersById([ownerId], memberQueries).get(ownerId);
  const name = member ? memberName(member) : t('actions.owner');

  return (
    <Tooltip>
      <Tooltip.Trigger delay={300} render={<span className="shrink-0" />}>
        <Avatar size="lg">
          <Avatar.Image src={readImage(member?.avatarUrl ?? undefined)} />
          <Avatar.Fallback>{name.charAt(0).toUpperCase()}</Avatar.Fallback>
        </Avatar>
      </Tooltip.Trigger>
      <Tooltip.Content>{t('board.owner', { name })}</Tooltip.Content>
    </Tooltip>
  );
};

/** The source and how long the lead has waited in its stage. */
const CardFooter = ({ lead }: { lead: BoardLead }) => {
  const t = useLeadsT();
  const days = daysSince(lead.leadStageChangedAt, useMinuteClock());

  return (
    <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
      {lead.source && (
        <span className="truncate rounded bg-muted px-1.5 py-0.5 capitalize">{lead.source}</span>
      )}
      {days !== null && (
        <span
          className={cn(
            'ml-auto flex shrink-0 items-center gap-1 tabular-nums',
            days >= 14 && 'text-warning',
          )}
          title={t('board.days-in-stage')}
        >
          <IconClockHour4 className="size-3.5" />
          {days === 0 ? t('today') : `${days}d`}
        </span>
      )}
    </div>
  );
};

const CardBody = ({ lead }: { lead: BoardLead }) => {
  const t = useLeadsT();
  const name = nameOf(lead) || t('board.unnamed');

  const contact = lead.primaryEmail
    ? { icon: IconMail, text: lead.primaryEmail }
    : lead.primaryPhone
      ? { icon: IconPhone, text: lead.primaryPhone }
      : null;

  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <Avatar size="lg" className="shrink-0">
          <Avatar.Image src={readImage(lead.avatarUrl ?? undefined)} />
          <Avatar.Fallback>{name.charAt(0)}</Avatar.Fallback>
        </Avatar>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
        {lead.ownerId && <OwnerAvatar ownerId={lead.ownerId} />}
      </div>
      {contact && (
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <contact.icon className="size-3.5 shrink-0" />
          <span className="truncate">{contact.text}</span>
        </span>
      )}
      {(lead.source || lead.leadStageChangedAt) && <CardFooter lead={lead} />}
    </>
  );
};

export const LeadCard = memo(function LeadCard({
  recordType,
  lead,
}: {
  recordType: LeadRecordType;
  lead: BoardLead;
}) {
  const t = useLeadsT();
  const openRecord = useOpenPanelRecord();

  return (
    <Board.Card
      id={lead.id}
      title={nameOf(lead) || t('board.unnamed')}
      onOpen={() =>
        openRecord({
          contentType: recordType === 'company' ? 'core:company' : 'core:customer',
          contentId: lead.id,
        })
      }
    >
      <CardBody lead={lead} />
    </Board.Card>
  );
});
