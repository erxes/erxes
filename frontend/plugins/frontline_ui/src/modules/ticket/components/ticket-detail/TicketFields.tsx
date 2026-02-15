import {
  BlockEditor,
  Combobox,
  Input,
  Separator,
  Tooltip,
  useBlockEditor,
  DropdownMenu,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { IconSquareToggle, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { ActivityList } from '@/activity/components/ActivityList';
import { Block } from '@blocknote/core';
import { Button } from 'erxes-ui';
import { ITicket } from '@/ticket/types';
import { IconTags } from '@tabler/icons-react';
import React from 'react';
import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { TagsSelect } from 'ui-modules';
import { useDebounce } from 'use-debounce';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { useTicketRemove } from '@/ticket/hooks/useRemoveTicket';

export const TicketFields = ({ ticket }: { ticket: ITicket }) => {
  const {
    _id: ticketId,
    priority,
    assigneeId,
    name: _name,
    targetDate,
    pipelineId,
    statusId,
    channelId,
    tagIds,
    isSubscribed: _isSubscribed,
    state: ticketState,
  } = ticket || {};
  const startDate = (ticket as any)?.startDate;
  const description = (ticket as any)?.description;
  const isFirstRun = React.useRef(true);
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
            'type' in block &&
            'content' in block,
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

  const parsedDescription = parseDescription(description);
  const initialDescriptionContent = parsedDescription;

  const [descriptionContent, setDescriptionContent] = useState<
    Block[] | undefined
  >(initialDescriptionContent);

  const editor = useBlockEditor({
    initialContent: descriptionContent,
    placeholder: 'Description...',
  });
  const { updateTicket } = useUpdateTicket();
  const { removeTicket } = useTicketRemove();
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
      <div
        className="space-x-2 flex items-center gap-2"
        onClick={() => {
          setSubscribe(!isSubscribed);
        }}
      >
        <Button variant="ghost">
          <legend>{isSubscribed ? 'UnSubscribe' : 'Subscribe'}</legend>
        </Button>
      </div>
    );
  };

  const [debouncedDescriptionContent] = useDebounce(descriptionContent, 1000);
  const [debouncedName] = useDebounce(name, 1000);

  const handleArchiveToggle = () => {
    const newState = state === 'active' ? 'archived' : 'active';
    const previousState = state;

    // Optimistically update the UI
    setState(newState);

    updateTicket({
      variables: {
        _id: ticketId,
        state: newState,
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: `Ticket ${
            newState === 'archived' ? 'archived' : 'restored'
          } successfully`,
        });
      },
      onError: (error) => {
        setState(previousState);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const handleDeleteTicket = async () => {
    confirm({
      message: 'Are you sure you want to delete this ticket?',
    }).then(async () => {
      try {
        await removeTicket(ticketId);
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Ticket deleted successfully',
        });
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      }
    });
  };

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDescriptionContent]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (isSubscribed === _isSubscribed) return;
    if (isSubscribed !== undefined) {
      updateTicket({
        variables: {
          _id: ticketId,
          isSubscribed: isSubscribed,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubscribed, _isSubscribed, ticketId]);
  return (
    <div className="flex flex-col gap-3 h-full px-5 py-8">
      <Input
        className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
        placeholder="Ticket Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />{' '}
      <TagsSelect.Provider
        value={tagIds || []}
        mode="multiple"
        type="frontline:ticket"
        onValueChange={(newTagIds: string[] | string) => {
          updateTicket({
            variables: {
              _id: ticketId,
              tagIds: newTagIds,
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
            <Tooltip.Content>Channel cannot be changed</Tooltip.Content>
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
            <Tooltip.Content>Pipeline cannot be changed</Tooltip.Content>
          </Tooltip>
          <SelectStatusTicket
            variant="detail"
            value={statusId}
            id={ticketId}
            pipelineId={pipelineId}
          />
          <SelectPriorityTicket
            id={ticketId}
            value={priority}
            variant="detail"
          />
          <SelectAssigneeTicket
            variant="detail"
            value={assigneeId}
            id={ticketId}
          />
          <SelectDateTicket
            value={startDate ? new Date(startDate) : undefined}
            id={ticketId}
            type="startDate"
            variant="detail"
          />
          <SelectDateTicket
            value={targetDate ? new Date(targetDate) : undefined}
            id={ticketId}
            type="targetDate"
            variant="detail"
          />
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="sm">
                <IconSquareToggle />
                {state === 'active' ? 'Archive' : 'Unarchive'}
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onSelect={handleArchiveToggle}>
                <IconSquareToggle />
                {state === 'active' ? 'Archive' : 'Unarchive'}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={handleDeleteTicket}
                className="text-destructive"
              >
                <IconTrash />
                Delete
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
      <Separator className="my-4" />
      <div className="min-h-56 overflow-y-auto">
        <BlockEditor
          editor={editor}
          onChange={handleDescriptionChange}
          className="min-h-full read-only"
        />
      </div>
      <ActivityList contentId={ticketId} contentDetail={ticket} />
    </div>
  );
};
