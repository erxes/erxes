import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { compactList } from '@/shared/utils/cursorList';
import { useGetTicketStatusById } from '@/status/hooks/useGetTicketStatus';
import AttachmentUploader from '@/ticket/components/attachments/AttachmentUploader';
import { SelectAssignedMembersTicket } from '@/ticket/components/ticket-selects/SelectAssignedMembersTicket';
import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectBranchTicket } from '@/ticket/components/ticket-selects/SelectBranchTicket';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';
import { SelectDepartmentTicket } from '@/ticket/components/ticket-selects/SelectDepartmentTicket';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { SelectTagsTicket } from '@/ticket/components/ticket-selects/SelectTagsTicket';
import { useTicketPermissions } from '@/ticket/hooks/useTicketPermissions';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import type { ITicketDetail } from '@/ticket/types';
import { toTicketAttachments } from '@/ticket/utils/ticketAttachments';
import { Editor, ScrollArea, TextField, useToast } from 'erxes-ui';
import { useFrontlineTranslation } from '@/shared/i18n/useFrontlineTranslation';
import {
  ContactRecordChip,
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelDescriptionField,
  PanelField,
  useSidePanel,
} from 'ui-modules';

const SCOPE = 'side-panel-ticket';

export const TicketPanelDetail = ({ ticket }: { ticket: ITicketDetail }) => {
  const { t } = useFrontlineTranslation('modules.ticket');
  const { toast } = useToast();
  const { updateTicket } = useUpdateTicket();
  const { openRecord } = useSidePanel();
  const { pipeline } = useGetPipeline(ticket.pipelineId ?? undefined);
  const { status, loading: statusLoading } = useGetTicketStatusById(
    ticket.statusId ?? undefined,
  );
  const permissions = useTicketPermissions({
    pipeline,
    assigneeId: ticket.assigneeId ?? undefined,
    status: status ? { ...status, value: status._id } : undefined,
  });
  const permissionsReady = !statusLoading && (!ticket.statusId || !!status);
  const canEdit = permissionsReady && permissions.canEditTicket;
  const canMove = permissionsReady && permissions.canMoveTicket;
  const { _id } = ticket;

  const saveName = (name: string) => {
    if (!canEdit) return;
    if (!name.trim()) {
      toast({
        title: t('error'),
        description: t('ticket-name-required'),
        variant: 'destructive',
      });
      return;
    }
    updateTicket({ variables: { _id, name: name.trim() } });
  };

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex flex-col gap-0.5 p-3">
        <PanelField label={t('name')}>
          <TextField
            scope={`${SCOPE}.name`}
            value={ticket.name || ''}
            placeholder={t('ticket-name')}
            className={PANEL_TEXT_FIELD_CLASS_NAME}
            disabled={!canEdit}
            onSave={saveName}
          />
        </PanelField>
        <PanelField label={t('status')}>
          <SelectStatusTicket
            variant="table"
            id={_id}
            value={ticket.statusId ?? ''}
            pipelineId={ticket.pipelineId ?? ''}
            disabled={!canMove}
          />
        </PanelField>
        <PanelField label={t('priority')}>
          <SelectPriorityTicket
            variant="table"
            id={_id}
            value={ticket.priority ?? undefined}
            disabled={!canEdit}
          />
        </PanelField>
        <PanelField label={t('assignee')}>
          <SelectAssigneeTicket
            variant="table"
            id={_id}
            value={ticket.assigneeId ?? ''}
            scope={`${SCOPE}.assignee`}
            disabled={!canEdit}
          />
        </PanelField>
        <PanelField label={t('members-title')}>
          <SelectAssignedMembersTicket
            variant="table"
            id={_id}
            value={compactList(ticket.assignedMembers)}
            scope={`${SCOPE}.members`}
            disabled={!canEdit}
          />
        </PanelField>
        <PanelField label={t('start-date')}>
          <SelectDateTicket
            id={_id}
            type="startDate"
            value={ticket.startDate ?? undefined}
            scope={`${SCOPE}.startDate`}
            disabled={!canEdit}
          />
        </PanelField>
        <PanelField label={t('target-date')}>
          <SelectDateTicket
            id={_id}
            type="targetDate"
            value={ticket.targetDate ?? undefined}
            scope={`${SCOPE}.targetDate`}
            disabled={!canEdit}
          />
        </PanelField>
        <PanelField label={t('channel')}>
          <SelectChannel
            variant="table"
            value={ticket.channelId ?? ''}
            disabled
          />
        </PanelField>
        <PanelField label={t('pipeline')}>
          <SelectPipeline
            variant="table"
            value={ticket.pipelineId ?? ''}
            channelId={ticket.channelId ?? undefined}
            disabled
          />
        </PanelField>
        <PanelField label={t('branch-label')}>
          <SelectBranchTicket
            variant="table"
            id={_id}
            value={ticket.branchId ?? ''}
            disabled={!canEdit}
          />
        </PanelField>
        <PanelField label={t('department-label')}>
          <SelectDepartmentTicket
            variant="table"
            id={_id}
            value={ticket.departmentId ?? ''}
            disabled={!canEdit}
          />
        </PanelField>
        <PanelField label={t('tags-label')}>
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
              label={kind === 'customer' ? t('customer') : t('company')}
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
        <fieldset disabled={!canEdit} className="min-w-0 pt-2">
          <AttachmentUploader
            id={_id}
            attachments={toTicketAttachments(ticket.attachments)}
          />
        </fieldset>
      </div>
    </ScrollArea>
  );
};
