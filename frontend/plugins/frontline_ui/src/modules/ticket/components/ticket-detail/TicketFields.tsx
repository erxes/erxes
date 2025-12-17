import {
  Input,
  Separator,
  useBlockEditor,
  BlockEditor,
  Tooltip,
} from 'erxes-ui';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { useDebounce } from 'use-debounce';
import { useEffect, useState } from 'react';
import { Block } from '@blocknote/core';
import { ITicket } from '@/ticket/types';
import { ActivityList } from '@/activity/components/ActivityList';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectTags } from 'ui-modules';

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
  } = ticket || {};

  const startDate = (ticket as any)?.startDate;
  const description = (ticket as any)?.description;

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
  const [name, setName] = useState(_name);

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
  return (
    <div className="flex flex-col gap-3 h-full">
      <Input
        className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
        placeholder="Ticket Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="gap-2 flex flex-wrap w-full">
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
        <SelectPriorityTicket id={ticketId} value={priority} variant="detail" />
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
        <SelectTags.Detail
          value={tagIds || []}
          tagType="frontline:ticket"
          onValueChange={(newTagIds: string[] | string) => {
            updateTicket({
              variables: {
                _id: ticketId,
                tagIds: newTagIds,
              },
            });
          }}
        />
      </div>
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
