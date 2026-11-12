import type { LeadRecordType } from '@erxes/core-contract';
import { useDraggable } from '@dnd-kit/core';
import { IconClockHour4, IconMail, IconPhone } from '@tabler/icons-react';
import { Avatar, cn, readImage, Tooltip } from 'erxes-ui';
import { memo } from 'react';
import { memberName, useMembersById } from '~/lib/members';
import { useMinuteClock } from '~/lib/useMinuteClock';
import { companyTitle, customerTitle } from '~/modules/contacts/components/ContactPicker';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { useLeadsT } from './i18n';
import type { BoardLead } from './useBoardMove';
import { daysSince } from './useLeads';

const nameOf = (lead: BoardLead) =>
  ('primaryName' in lead ? companyTitle(lead) : customerTitle(lead)) || '';

/** The owner as an avatar; their name on hover. */
const OwnerAvatar = ({ ownerId }: { ownerId: string }) => {
  const t = useLeadsT();
  const member = useMembersById([ownerId]).get(ownerId);
  const name = member ? memberName(member) : t('actions.owner');

  return (
    <Tooltip delayDuration={300}>
      <Tooltip.Trigger asChild>
        <span className="shrink-0">
          <Avatar size="lg">
            <Avatar.Image src={readImage(member?.avatarUrl ?? undefined)} />
            <Avatar.Fallback>{name.charAt(0).toUpperCase()}</Avatar.Fallback>
          </Avatar>
        </span>
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

export const CardBody = ({ lead }: { lead: BoardLead }) => {
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

export const CARD =
  'flex select-none flex-col gap-2 rounded-lg border bg-background p-3 text-left shadow-xs';

export const LeadCard = memo(function LeadCard({
  recordType,
  lead,
}: {
  recordType: LeadRecordType;
  lead: BoardLead;
}) {
  const { openRecord } = useSidePanel();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() =>
        openRecord({
          contentType: recordType === 'company' ? 'core:company' : 'core:customer',
          contentId: lead.id,
        })
      }
      className={cn(
        CARD,
        'block w-full cursor-grab text-left outline-none transition-[box-shadow,border-color,opacity] hover:border-foreground/15 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing',
        // A placeholder stays where the card was while its copy is dragged.
        isDragging && 'border-dashed opacity-40 shadow-none',
      )}
    >
      <CardBody lead={lead} />
    </button>
  );
});
