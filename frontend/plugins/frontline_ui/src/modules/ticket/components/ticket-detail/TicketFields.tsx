import { Input, Separator, useBlockEditor, BlockEditor } from 'erxes-ui';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { useDebounce } from 'use-debounce';
import { useEffect, useState } from 'react';
import { Block } from '@blocknote/core';
import { ITicket } from '@/ticket/types';
// import { ActivityList } from '@/activity/components/ActivityList';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';

export const TicketFields = ({ ticket }: { ticket: ITicket }) => {
  const {
    _id: ticketId,
    priority,
    assigneeId,
    name: _name,
    targetDate,
    pipelineId,
    statusId,
  } = ticket || {};

  const startDate = (ticket as any)?.startDate;
  const description = (ticket as any)?.description;
  const parsedDescription = description ? JSON.parse(description) : undefined;
  const initialDescriptionContent =
    Array.isArray(parsedDescription) && parsedDescription.length > 0
      ? parsedDescription
      : undefined;

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
    if (
      JSON.stringify(debouncedDescriptionContent) ===
      JSON.stringify(description ? JSON.parse(description) : undefined)
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
    <div className="flex flex-col gap-3">
      <Input
        className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
        placeholder="Ticket Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="gap-2 flex flex-wrap w-full">
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
      </div>
      <Separator className="my-4" />
      <div className="min-h-56 overflow-y-auto">
        <BlockEditor
          editor={editor}
          onChange={handleDescriptionChange}
          className="min-h-full read-only"
        />
      </div>
      {/* <ActivityList contentId={ticketId} contentDetail={ticket} /> */}
    </div>
  );
};
