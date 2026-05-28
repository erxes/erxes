import { Badge, Card, Separator, Tooltip } from 'erxes-ui';
import { IconBuildingSkyscraper, IconMapPin } from '@tabler/icons-react';

import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { PriorityBadge } from '@/deals/components/deal-selects/PriorityInline';
import { IDeal } from '@/deals/types/deals';
import { ItemFooter } from '@/deals/cards/components/item/Footer';
import Labels from '@/deals/cards/components/detail/overview/label/Labels';

const PRIORITY_MAP: Record<string, number> = {
  'No Priority': 0,
  Minor: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

const OverflowItems = ({ items }: { items: { title: string }[] }) => {
  const [first, ...rest] = items;
  if (!rest.length) {
    return (
      <span className="font-medium text-foreground truncate min-w-0">
        {first.title}
      </span>
    );
  }
  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span className="flex items-center gap-1 min-w-0 cursor-default">
            <span className="font-medium text-foreground truncate min-w-0">
              {first.title}
            </span>
            <span className="shrink-0 text-muted-foreground">+{rest.length}</span>
          </span>
        </Tooltip.Trigger>
        <Tooltip.Content>{items.map((i) => i.title).join(', ')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const DealWidgetCard = ({ deal }: { deal: IDeal }) => {
  const {
    startDate,
    closeDate,
    name,
    number,
    priority,
    stage,
    status,
    _id,
    createdAt,
    assignedUsers,
    labels,
    boardId,
    pipeline,
    departments,
    branches,
  } = deal || {};

  const priorityNum = PRIORITY_MAP[priority || ''] ?? 0;
  const isArchived = status === 'archived';
  const hasDepartments = !!departments?.length;
  const hasBranches = !!branches?.length;

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
        <div className="flex flex-col gap-1 min-w-0">
          <h5 className="font-semibold">{name}</h5>
          {(priorityNum > 0 || stage?.name || isArchived || hasDepartments || hasBranches) && (
            <div className="mt-1.5 grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-xs overflow-hidden">
              {stage?.name && (
                <>
                  <span className="text-muted-foreground">Stage</span>
                  <span className="font-medium text-foreground truncate min-w-0">{stage.name}</span>
                </>
              )}
              {priorityNum > 0 && (
                <>
                  <span className="text-muted-foreground">Priority</span>
                  <PriorityBadge priority={priorityNum} className="text-xs py-0 h-5 w-fit" />
                </>
              )}
              {hasDepartments && (
                <>
                  <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                    <IconBuildingSkyscraper className="size-3.5 shrink-0" />
                    Dept.
                  </span>
                  <OverflowItems items={departments} />
                </>
              )}
              {hasBranches && (
                <>
                  <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                    <IconMapPin className="size-3.5 shrink-0" />
                    Branch
                  </span>
                  <OverflowItems items={branches} />
                </>
              )}
              {isArchived && (
                <>
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="text-xs py-0 h-5 w-fit">Archived</Badge>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <Separator />
      <ItemFooter
        number={number}
        createdAt={createdAt}
        assignedUsers={assignedUsers || []}
        id={_id}
      />
    </Card>
  );
};
