import { ActivityList } from '@/activity/components/ActivityList';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { useGetTicketStatusById } from '@/status/hooks/useGetTicketStatus';
import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectAssignedMembersTicket } from '@/ticket/components/ticket-selects/SelectAssignedMembersTicket';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { useTicketRemove } from '@/ticket/hooks/useRemoveTicket';
import { useRemoveTicketsFromView } from '@/ticket/hooks/useRemoveTicketsFromView';
import { useTicketPermissions } from '@/ticket/hooks/useTicketPermissions';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { GET_TICKETS } from '@/ticket/graphql/queries/getTickets';
import { ITicket } from '@/ticket/types';
import { Block } from '@blocknote/core';
import { IconSquareToggle, IconTags, IconTrash } from '@tabler/icons-react';
import {
  BlockEditor,
  Button,
  Combobox,
  DropdownMenu,
  Input,
  Separator,
  Tooltip,
  useBlockEditor,
  useConfirm,
  useQueryState,
  useToast,
} from 'erxes-ui';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TagsSelect } from 'ui-modules';
import { useDebounce } from 'use-debounce';
import { AttachmentProvider } from '../attachments/AttachmentContext';
import AttachmentUploader from '../attachments/AttachmentUploader';

export const TicketFields = ({ ticket }: { ticket: ITicket }) => {
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
    tagIds,
    isSubscribed: _isSubscribed,
    state: ticketState,
    attachments,
    startDate,
    description,
  } = ticket;
  const isFirstRun = React.useRef(true);
  const isRemovedRef = React.useRef(false);
  const selectedTagIds = useMemo(() => tagIds ?? [], [tagIds]);
  const initialAttachments = useMemo(() => attachments ?? [], [attachments]);
  const [state, setState] = useState(ticketState || 'active');
  const { confirm } = useConfirm();
  const { toast } = useToast();
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
    } catch {
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

  const parsedDescription = parseDescription(description);
  const initialDescriptionContent = parsedDescription;

  const [descriptionContent, setDescriptionContent] = useState<
    Block[] | undefined
  >(initialDescriptionContent);

  const editor = useBlockEditor({
    initialContent: descriptionContent,
    placeholder: t('description-ellipsis'),
  });
  const { pipeline } = useGetPipeline(pipelineId);
  const { status: currentStatus } = useGetTicketStatusById(statusId);
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
  const { removeTicket } = useTicketRemove();
  const { removeTicketsFromView } = useRemoveTicketsFromView();
  const [stateFilter] = useQueryState<string>('state');
  const [name, setName] = useState(_name);
  const [isSubscribed, setSubscribe] = useState<boolean>(
    _isSubscribed || false,
  );

  const handleDescriptionChange = async () => {
    const content = await editor?.document;
    if (content) {
      content.pop();
      setDescriptionContent(content as Block[]);
    }
  };

  const FieldSubscribeSwitch = ({
    isSubscribed,
  }: {
    isSubscribed: boolean;
  }) => {
    return (
      <Button
        type="button"
        variant="ghost"
        disabled={!canEditTicket}
        onClick={() => {
          setSubscribe(!isSubscribed);
        }}
      >
        {isSubscribed ? t('unsubscribe') : t('subscribe')}
      </Button>
    );
  };

  const [debouncedDescriptionContent, descriptionDebounce] = useDebounce(
    descriptionContent,
    1000,
  );
  const [debouncedName, nameDebounce] = useDebounce(name, 1000);

  const handleArchiveToggle = () => {
    const newState = state === 'active' ? 'archived' : 'active';
    const previousState = state;

    setState(newState);

    updateTicket({
      variables: {
        _id: ticketId,
        state: newState,
      },
      refetchQueries: [GET_TICKETS],
      onCompleted: () => {
        if (newState !== (stateFilter || 'active')) {
          removeTicketsFromView([ticketId]);
        }
        toast({
          title: t('success'),
          description:
            newState === 'archived'
              ? t('ticket-archived-successfully')
              : t('ticket-restored-successfully'),
        });
      },
      onError: (error) => {
        setState(previousState);
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const handleDeleteTicket = async () => {
    confirm({
      message: t('confirm-delete-ticket'),
    }).then(async () => {
      isRemovedRef.current = true;
      nameDebounce.cancel();
      descriptionDebounce.cancel();
      try {
        await removeTicket([ticketId]);
        toast({
          title: t('success'),
          variant: 'success',
          description: t('ticket-deleted-successfully'),
        });
      } catch (error) {
        isRemovedRef.current = false;
        toast({
          title: t('error'),
          description:
            error instanceof Error ? error.message : t('ticket-not-found'),
          variant: 'destructive',
        });
      }
    });
  };

  useEffect(() => {
    if (isRemovedRef.current || !ticketId) return;
    if (!debouncedName || debouncedName === _name) return;
    updateTicket({
      variables: {
        _id: ticketId,
        name: debouncedName,
      },
    });
  }, [debouncedName, _name, ticketId, updateTicket]);
  useEffect(() => {
    if (isRemovedRef.current || !ticketId) return;
    if (!debouncedDescriptionContent) return;
    const currentParsed = parseDescription(description);
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
  }, [debouncedDescriptionContent, description, ticketId, updateTicket]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (isRemovedRef.current || !ticketId) return;
    if (isSubscribed === _isSubscribed) return;
    if (isSubscribed !== undefined) {
      updateTicket({
        variables: {
          _id: ticketId,
          isSubscribed: isSubscribed,
        },
      });
    }
  }, [isSubscribed, _isSubscribed, ticketId, updateTicket]);
  return (
    <AttachmentProvider
      ticketId={ticketId}
      initialAttachments={initialAttachments}
    >
      <div className="flex flex-col gap-3 h-full px-5 py-8">
        <Input
          className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
          placeholder={t('ticket-name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!canEditTicket}
        />{' '}
        <TagsSelect.Provider
          value={selectedTagIds}
          mode="multiple"
          type="frontline:ticket"
          onValueChange={(newTagIds: string[] | string) => {
            updateTicket({
              variables: {
                _id: ticketId,
                tagIds: Array.isArray(newTagIds) ? newTagIds : [newTagIds],
              },
            });
          }}
        >
          <div className="gap-2 flex flex-wrap w-full items-center">
            <Tooltip>
              <div className="relative">
                <Tooltip.Trigger className="absolute inset-0 cursor-not-allowed"></Tooltip.Trigger>
                <SelectChannel value={channelId} variant="detail" disabled />
              </div>
              <Tooltip.Content>
                {t('channel-cannot-be-changed')}
              </Tooltip.Content>
            </Tooltip>
            <Tooltip>
              <div className="relative">
                <Tooltip.Trigger className="absolute inset-0 cursor-not-allowed"></Tooltip.Trigger>
                <SelectPipeline
                  value={pipelineId}
                  variant="detail"
                  channelId={channelId}
                  disabled
                />
              </div>
              <Tooltip.Content>
                {t('pipeline-cannot-be-changed')}
              </Tooltip.Content>
            </Tooltip>
            <SelectStatusTicket
              variant="detail"
              value={statusId}
              id={ticketId}
              pipelineId={pipelineId}
              disabled={!canMoveTicket}
            />
            <SelectPriorityTicket
              id={ticketId}
              value={priority}
              variant="detail"
              disabled={!canEditTicket}
            />
            <SelectAssigneeTicket
              variant="detail"
              value={assigneeId}
              id={ticketId}
              disabled={!canEditTicket}
            />
            <SelectAssignedMembersTicket
              variant="detail"
              value={assignedMembers}
              id={ticketId}
              disabled={!canEditTicket}
            />
            <SelectDateTicket
              value={startDate ? new Date(startDate) : undefined}
              id={ticketId}
              type="startDate"
              variant="detail"
              disabled={!canEditTicket}
            />
            <SelectDateTicket
              value={targetDate ? new Date(targetDate) : undefined}
              id={ticketId}
              type="targetDate"
              variant="detail"
              disabled={!canEditTicket}
            />
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button variant="ghost" size="sm">
                  <IconSquareToggle />
                  {state === 'active' ? t('archive') : t('unarchive')}
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onSelect={handleArchiveToggle}>
                  <IconSquareToggle />
                  {state === 'active' ? t('archive') : t('unarchive')}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={handleDeleteTicket}
                  className="text-destructive"
                >
                  <IconTrash />
                  {t('delete')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
            <FieldSubscribeSwitch isSubscribed={isSubscribed} />
            <IconTags className="size-5 ml-2"></IconTags>
            <TagsSelect.SelectedList />
            <TagsSelect.Trigger variant="ICON" />
            <Combobox.Content>
              <TagsSelect.Content />
            </Combobox.Content>
          </div>
        </TagsSelect.Provider>
        <AttachmentUploader
          id={ticketId}
          attachments={ticket?.attachments || []}
        />
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
