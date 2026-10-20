import { ActivityList } from '@/activity/components/ActivityList';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { useGetTicketStatusById } from '@/status/hooks/useGetTicketStatus';
import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectAssignedMembersTicket } from '@/ticket/components/ticket-selects/SelectAssignedMembersTicket';
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
import type { TicketFieldsProps } from '@/ticket/types/ticketDetail';
import { toTicketAttachments } from '@/ticket/utils/ticketAttachments';
import { compactList } from '@/shared/utils/cursorList';
import { Block } from '@blocknote/core';
import {
  BlockEditor,
  Input,
  Separator,
  Tooltip,
  useBlockEditor,
} from 'erxes-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { AttachmentProvider } from '@/ticket/components/attachments/AttachmentContext';
import AttachmentUploader from '@/ticket/components/attachments/AttachmentUploader';

const LockedField = ({
  message,
  children,
}: {
  message: string;
  children: React.ReactNode;
}) => (
  <Tooltip>
    <div className="relative">
      <Tooltip.Trigger className="absolute inset-0 cursor-not-allowed" />
      {children}
    </div>
    <Tooltip.Content>{message}</Tooltip.Content>
  </Tooltip>
);

export const TicketFields = ({ ticket, titleAction }: TicketFieldsProps) => {
  const { t } = useTranslation('frontline');
  const {
    _id: ticketId,
    priority,
    assigneeId,
    assignedMembers,
    name: _name,
    targetDate,
    pipelineId,
    statusId,
    channelId,
    branchId,
    departmentId,
    tagIds,
    attachments,
    startDate,
    description,
  } = ticket || {};
  const ticketAttachments = React.useMemo(
    () => toTicketAttachments(attachments),
    [attachments],
  );
  const parseDescription = (desc: string | undefined): Block[] | undefined => {
    if (!desc) return undefined;
    try {
      const parsed = JSON.parse(desc);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every(
          (block) =>
            typeof block === 'object' &&
            block !== null &&
            'id' in block &&
            'type' in block,
        )
      ) {
        return parsed as Block[];
      }
    } catch (error) {
      console.debug(
        'Failed to parse description as JSON, treating as plain text:',
        error,
      );
      const lines = desc.split('\n');
      if (lines.length === 0) return undefined;

      return lines.map((line) => ({
        id: crypto.randomUUID(),
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: line
          ? [
              {
                type: 'text',
                text: line,
                styles: {},
              },
            ]
          : [],
        children: [],
      })) as Block[];
    }
    return undefined;
  };

  const parsedDescription = parseDescription(description ?? undefined);
  const initialDescriptionContent = parsedDescription;

  const [descriptionContent, setDescriptionContent] = useState<
    Block[] | undefined
  >(initialDescriptionContent);
  const loadedDescriptionRef = React.useRef(descriptionContent);

  const editor = useBlockEditor({
    initialContent: descriptionContent,
    placeholder: t('description-ellipsis', 'Description...'),
  });
  const { pipeline } = useGetPipeline(pipelineId ?? undefined);
  const { status: currentStatus } = useGetTicketStatusById(
    statusId ?? undefined,
  );
  const { canEditTicket, canMoveTicket } = useTicketPermissions({
    pipeline,
    status: currentStatus
      ? {
          value: currentStatus._id,
          memberIds: currentStatus.memberIds,
          canMoveMemberIds: currentStatus.canMoveMemberIds,
          canEditMemberIds: currentStatus.canEditMemberIds,
          visibilityType: currentStatus.visibilityType,
        }
      : undefined,
  });

  const { updateTicket } = useUpdateTicket();
  const [name, setName] = useState(_name ?? '');

  const handleDescriptionChange = async () => {
    const content = await editor?.document;
    if (content) {
      content.pop();
      setDescriptionContent(content as Block[]);
    }
  };

  const [debouncedDescriptionContent] = useDebounce(descriptionContent, 1000);
  const [debouncedName] = useDebounce(name, 1000);

  useEffect(() => {
    if (!ticketId) return;
    if (!debouncedName || debouncedName === _name) return;
    updateTicket({
      variables: {
        _id: ticketId,
        name: debouncedName,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName]);
  useEffect(() => {
    if (!ticketId) return;
    if (!debouncedDescriptionContent) return;
    if (debouncedDescriptionContent === loadedDescriptionRef.current) return;
    const currentParsed = parseDescription(description ?? undefined);
    if (
      JSON.stringify(debouncedDescriptionContent) ===
      JSON.stringify(currentParsed)
    ) {
      return;
    }
    updateTicket({
      variables: {
        _id: ticketId,
        description: JSON.stringify(debouncedDescriptionContent),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDescriptionContent]);

  return (
    <AttachmentProvider
      ticketId={ticketId}
      initialAttachments={ticketAttachments}
    >
      <div className="flex flex-col gap-3 h-full px-5 py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Input
              className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
              placeholder={t('ticket-name', 'Ticket Name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEditTicket}
            />
          </div>
          {titleAction}
        </div>
        <div className="gap-2 flex flex-wrap w-full items-center">
          <LockedField
            message={t(
              'channel-cannot-be-changed',
              'Channel cannot be changed',
            )}
          >
            <SelectChannel
              value={channelId ?? ''}
              variant="detail"
              label={t('channel', 'Channel')}
              disabled
            />
          </LockedField>
          <LockedField
            message={t(
              'pipeline-cannot-be-changed',
              'Pipeline cannot be changed',
            )}
          >
            <SelectPipeline
              value={pipelineId ?? ''}
              variant="detail"
              channelId={channelId ?? undefined}
              label={t('pipeline', 'Pipeline')}
              disabled
            />
          </LockedField>
          <SelectBranchTicket
            id={ticketId}
            value={branchId || ''}
            variant="detail"
            label={t('branch-label', 'Branch')}
            disabled={!canEditTicket}
          />
          <SelectDepartmentTicket
            id={ticketId}
            value={departmentId || ''}
            variant="detail"
            label={t('department-label', 'Department')}
            disabled={!canEditTicket}
          />
          <SelectStatusTicket
            variant="detail"
            value={statusId ?? ''}
            id={ticketId}
            pipelineId={pipelineId ?? ''}
            label={t('status', 'Status')}
            disabled={!canMoveTicket}
          />
          <SelectPriorityTicket
            id={ticketId}
            value={priority ?? undefined}
            variant="detail"
            label={t('priority', 'Priority')}
            disabled={!canEditTicket}
          />
          <SelectAssigneeTicket
            variant="detail"
            value={assigneeId ?? ''}
            id={ticketId}
            label={t('assignee', 'Assignee')}
            disabled={!canEditTicket}
          />
          <SelectAssignedMembersTicket
            variant="detail"
            value={assignedMembers ? compactList(assignedMembers) : undefined}
            id={ticketId}
            label={t('members-title', 'Members')}
            disabled={!canEditTicket}
          />
          <SelectDateTicket
            value={startDate ? new Date(startDate) : undefined}
            id={ticketId}
            type="startDate"
            variant="input"
            label={t('start-date', 'Start date')}
            disabled={!canEditTicket}
          />
          <SelectDateTicket
            value={targetDate ? new Date(targetDate) : undefined}
            id={ticketId}
            type="targetDate"
            variant="input"
            label={t('target-date', 'Target date')}
            disabled={!canEditTicket}
          />
          <SelectTagsTicket
            id={ticketId}
            value={compactList(tagIds)}
            variant="detail"
            label={t('tags', 'Tags')}
            disabled={!canEditTicket}
          />
        </div>
        <AttachmentUploader id={ticketId} attachments={ticketAttachments} />
        <Separator className="mt-4" />
        <div className="min-h-56 overflow-y-auto">
          <BlockEditor
            editor={editor}
            onChange={canEditTicket ? handleDescriptionChange : undefined}
            className={`min-h-full read-only${
              !canEditTicket ? ' pointer-events-none opacity-60' : ''
            }`}
          />
        </div>
        <ActivityList contentId={ticketId} contentDetail={ticket} />
      </div>
    </AttachmentProvider>
  );
};
