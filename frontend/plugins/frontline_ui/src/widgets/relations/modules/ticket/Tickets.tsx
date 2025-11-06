import { IconTicketOff } from '@tabler/icons-react';
import { ScrollArea, Separator } from 'erxes-ui';
import { IRelationWidgetProps, useRelations } from 'ui-modules';
import { useCreateMultipleRelations } from 'ui-modules';
import { AddTicketSheet } from '@/ticket/components/add-ticket/AddTicketSheet';
import { ticketCreateDefaultValuesState } from '@/ticket/states/ticketCreateSheetState';
import { useSetAtom } from 'jotai';
import { useQueryState } from 'erxes-ui';
import { TicketWidget } from './TicketWidget';

export const TicketRelationWidget = ({
  contentId,
  contentType,
  customerId,
  companyId,
}: IRelationWidgetProps) => {
  const { ownEntities } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'frontline:ticket',
    },
  });

  const { createMultipleRelations } = useCreateMultipleRelations();

  const onComplete = (ticketId: string) => {
    const createRelation = (ct: string, cid: string) => ({
      entities: [
        { contentType: ct, contentId: cid },
        { contentType: 'frontline:ticket', contentId: ticketId },
      ],
    });

    const relationKeys = new Set<string>();

    const relations = [
      [contentType, contentId],
      ...(customerId ? [['core:customer', customerId]] : []),
      ...(companyId ? [['core:company', companyId]] : []),
    ]
      .filter(([ct, cid]) => {
        const key = `${ct}:${cid}`;
        if (relationKeys.has(key)) {
          return false;
        }
        relationKeys.add(key);
        return true;
      })
      .map(([ct, cid]) => createRelation(ct, cid));

    createMultipleRelations(relations);
  };

  const setTicketCreateDefaultValues = useSetAtom(
    ticketCreateDefaultValuesState,
  );
  const [channelId] = useQueryState<string>('channelId');
  const onClick = () => {
    setTicketCreateDefaultValues({
      channelId: channelId || undefined,
    });
  };

  if (ownEntities?.length === 0) {
    return (
      <div className="flex flex-auto flex-col gap-4 justify-center items-center text-muted-foreground">
        <div className="border border-dashed p-6 bg-background rounded-xl">
          <IconTicketOff />
        </div>
        <span className="text-sm">No tickets to display at the moment.</span>
        <AddTicketSheet
          onComplete={onComplete}
          variant="secondary"
          isRelation={true}
        />
      </div>
    );
  }

  return (
    <>
      <div className="h-11 px-4 flex items-center gap-2 flex-none bg-background justify-between">
        <span className="font-medium text-primary">Tickets</span>
        <AddTicketSheet
          onComplete={onComplete}
          onClick={onClick}
          variant="secondary"
          isRelation={true}
        />
      </div>
      <Separator />
      <ScrollArea className="flex-auto">
        <div className="flex flex-col gap-4 p-4">
          {ownEntities?.map((entity) => (
            <TicketWidget key={entity.contentId} ticketId={entity.contentId} />
          ))}
        </div>
      </ScrollArea>
    </>
  );
};
