import { compactList } from '@/shared/utils/cursorList';
import { TicketAttachments } from '@/ticket/components/attachments/TicketAttachments';
import { SelectAssignedMembersTicket } from '@/ticket/components/ticket-selects/SelectAssignedMembersTicket';
import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectBranchTicket } from '@/ticket/components/ticket-selects/SelectBranchTicket';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import {
  formatDateLabel,
  SelectDateTicket,
} from '@/ticket/components/ticket-selects/SelectDateTicket';
import { SelectDepartmentTicket } from '@/ticket/components/ticket-selects/SelectDepartmentTicket';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { SelectTagsTicket } from '@/ticket/components/ticket-selects/SelectTagsTicket';
import { useTicketDetailPermissions } from '@/ticket/hooks/useTicketDetailPermissions';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import type { ITicketDetail } from '@/ticket/types';
import { toTicketAttachments } from '@/ticket/utils/ticketAttachments';
import {
  IconAlignLeft,
  IconBuilding,
  IconCalendar,
  IconCalendarDue,
  IconCalendarTime,
  IconCircleCheck,
  IconFlag,
  IconFolder,
  IconGitBranch,
  IconHierarchy,
  IconTags,
  IconUser,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import { Combobox, Editor, Popover, ScrollArea, TextField } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ContactRecordChip,
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelDescriptionField,
  PanelField,
  useSidePanel,
} from 'ui-modules';

const SCOPE = 'side-panel-ticket';

/** Renders ticket detail fields, linked contacts and permission-gated attachments. */
export const TicketPanelDetail = ({ ticket }: { ticket: ITicketDetail }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.ticket' });
  const { updateTicket } = useUpdateTicket();
  const { openRecord } = useSidePanel();
  const { canEditTicket: canEdit, canMoveTicket: canMove } =
    useTicketDetailPermissions(ticket);
  const { _id } = ticket;
  const ticketAttachments = useMemo(
    () => toTicketAttachments(ticket.attachments),
    [ticket.attachments],
  );

  const statusChangedDate = (
    <Popover>
      <Combobox.ChipTrigger disabled>
        {ticket.statusChangedDate
          ? formatDateLabel(new Date(ticket.statusChangedDate))
          : t('not-specified')}
      </Combobox.ChipTrigger>
    </Popover>
  );

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="grid gap-5 p-3 @3xl/record-panel:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] @3xl/record-panel:p-6">
        <div className="flex min-w-0 flex-col gap-1">
          <PanelField icon={IconAlignLeft} label={t('name')}>
            <TextField
              scope={`${SCOPE}.name`}
              value={ticket.name || ''}
              placeholder={t('ticket-name')}
              className={PANEL_TEXT_FIELD_CLASS_NAME}
              disabled={!canEdit}
              onSave={(name) => {
                if (name) updateTicket({ variables: { _id, name } });
              }}
            />
          </PanelField>
          <PanelField icon={IconCircleCheck} label={t('status')}>
            <SelectStatusTicket
              variant="table"
              id={_id}
              value={ticket.statusId ?? ''}
              pipelineId={ticket.pipelineId ?? ''}
              disabled={!canMove}
            />
          </PanelField>
          <PanelField icon={IconFlag} label={t('priority')}>
            <SelectPriorityTicket
              variant="table"
              id={_id}
              value={ticket.priority ?? undefined}
              disabled={!canEdit}
            />
          </PanelField>
          <PanelField icon={IconUser} label={t('assignee')}>
            <SelectAssigneeTicket
              variant="table"
              id={_id}
              value={ticket.assigneeId ?? ''}
              scope={`${SCOPE}.assignee`}
              disabled={!canEdit}
            />
          </PanelField>
          <PanelField icon={IconUsersGroup} label={t('members-title')}>
            <SelectAssignedMembersTicket
              variant="table"
              id={_id}
              value={compactList(ticket.assignedMembers)}
              scope={`${SCOPE}.members`}
              disabled={!canEdit}
            />
          </PanelField>
          <PanelField icon={IconCalendar} label={t('start-date')}>
            <SelectDateTicket
              id={_id}
              type="startDate"
              value={ticket.startDate ?? undefined}
              scope={`${SCOPE}.startDate`}
              disabled={!canEdit}
            />
          </PanelField>
          <PanelField icon={IconCalendarDue} label={t('target-date')}>
            <SelectDateTicket
              id={_id}
              type="targetDate"
              value={ticket.targetDate ?? undefined}
              scope={`${SCOPE}.targetDate`}
              disabled={!canEdit}
            />
          </PanelField>
          <PanelField icon={IconCalendarTime} label={t('status-changed-date')}>
            {statusChangedDate}
          </PanelField>
          <PanelField icon={IconFolder} label={t('channel')}>
            <SelectChannel
              variant="table"
              value={ticket.channelId ?? ''}
              disabled
            />
          </PanelField>
          <PanelField icon={IconGitBranch} label={t('pipeline')}>
            <SelectPipeline
              variant="table"
              value={ticket.pipelineId ?? ''}
              channelId={ticket.channelId ?? undefined}
              disabled
            />
          </PanelField>
          <PanelField icon={IconGitBranch} label={t('branch-label')}>
            <SelectBranchTicket
              variant="table"
              id={_id}
              value={ticket.branchId ?? ''}
              disabled={!canEdit}
            />
          </PanelField>
          <PanelField icon={IconHierarchy} label={t('department-label')}>
            <SelectDepartmentTicket
              variant="table"
              id={_id}
              value={ticket.departmentId ?? ''}
              disabled={!canEdit}
            />
          </PanelField>
          <PanelField icon={IconTags} label={t('tags-label')}>
            <SelectTagsTicket
              variant="table"
              id={_id}
              value={compactList(ticket.tagIds)}
              scope={`${SCOPE}.tags`}
              disabled={!canEdit}
            />
          </PanelField>
          {(['customer', 'company'] as const).map((kind) => {
            const field = kind === 'customer' ? 'customerId' : 'companyId';
            const value = ticket[field];

            return (
              <PanelField
                key={kind}
                icon={kind === 'customer' ? IconUsers : IconBuilding}
                label={
                  kind === 'customer'
                    ? t('customer-label', { keyPrefix: '' })
                    : t('company-label', { keyPrefix: '' })
                }
              >
                {value ? (
                  <ContactRecordChip
                    kind={kind}
                    id={value}
                    onOpen={() =>
                      openRecord(
                        { contentType: `core:${kind}`, contentId: value },
                        { stack: true },
                      )
                    }
                  />
                ) : (
                  <span className="px-1 text-xs text-muted-foreground">
                    {t('not-specified')}
                  </span>
                )}
              </PanelField>
            );
          })}
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          {canEdit ? (
            <PanelDescriptionField
              key={_id}
              label={t('description')}
              value={ticket.description || ''}
              scope={`${SCOPE}.description`}
              onSave={(description) =>
                updateTicket({ variables: { _id, description } })
              }
            />
          ) : (
            <div className="flex flex-col gap-1.5 pt-2">
              <span className="text-xs font-medium text-accent-foreground">
                {t('description')}
              </span>
              <Editor
                initialContent={ticket.description || ''}
                onChange={() => undefined}
                readonly
                className="h-auto min-h-20 rounded-sm shadow-none"
              />
            </div>
          )}
          <div className="min-w-0 pt-2">
            <TicketAttachments
              id={_id}
              attachments={ticketAttachments}
              canEdit={canEdit}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
