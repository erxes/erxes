import { Card, Separator } from 'erxes-ui';

import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { IDeal } from '@/deals/types/deals';
import { ItemFooter } from '@/deals/cards/components/item/Footer';
import Labels from '@/deals/cards/components/detail/overview/label/Labels';

export const DealWidgetCard = ({ deal }: { deal: IDeal }) => {
  const {
    startDate,
    closeDate,
    name,
    _id,
    createdAt,
    assignedUsers,
    labels,
    boardId,
    pipeline,
  } = deal || {};

  const onCardClick = () => {
    const dealUrl = `/sales/deals?boardId=${boardId}&pipelineId=${pipeline._id}&salesItemId=${_id}`;
    window.open(dealUrl, '_blank');
  };

  return (
    <Card
      className="bg-background cursor-pointer"
      onClick={() => onCardClick()}
    >
      <div className="px-2 h-9 flex flex-row items-center justify-between space-y-0">
        <DateSelectDeal
          value={startDate}
          id={_id}
          type="startDate"
          variant="card"
          placeholder="Start Date"
        />
        <DateSelectDeal
          value={closeDate}
          id={_id}
          type="closeDate"
          variant="card"
          placeholder="Close Date"
        />
      </div>
      <Separator />
      <div className="p-3">
        {labels && labels.length !== 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Labels labels={labels} type="toggle" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <h5 className="font-semibold">{name}</h5>
        </div>
      </div>
      <Separator />
      <ItemFooter
        createdAt={createdAt}
        assignedUsers={assignedUsers || []}
        id={_id}
      />
    </Card>
  );
};
