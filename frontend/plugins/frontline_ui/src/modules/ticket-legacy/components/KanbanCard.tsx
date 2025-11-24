import {
  IconCalendarClock,
  IconCalendarEventFilled,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { Badge, Button, Calendar, Popover, Separator } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { currentUserState, MembersInline } from 'ui-modules';

export const KanbanViewCard = ({ feature }: { feature: any }) => {
  const currentUser = useAtomValue(currentUserState);
  return (
    <>
      <div className="flex items-center justify-between h-9 px-1.5">
        <KanbanDatePicker date={new Date()} onChange={() => {}} />
        <KanbanDatePicker date={feature.endAt} onChange={() => {}} />
      </div>
      <Separator />
      <div className="p-3 flex flex-col gap-3">
        {feature.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {feature.tags.map((tag: any, index: number) => (
              <Badge
                variant={index % 2 === 0 ? 'info' : 'warning'}
                key={tag.id}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <h5 className="font-semibold">{feature.name}</h5>
          <div className="text-accent-foreground">{feature.number}</div>
        </div>
      </div>
      <Separator />
      <div className="h-9 flex items-center justify-between px-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground px-1"
        >
          <IconCalendarEventFilled />
          May 5, 2025
        </Button>
        <MembersInline.Provider memberIds={[currentUser?._id || '']}>
          <MembersInline.Avatar />
        </MembersInline.Provider>
      </div>
    </>
  );
};

export const KanbanDatePicker = ({
  date,
  onChange,
}: {
  date: Date;
  onChange: (date: Date) => void;
}) => {
  return (
    <Popover>
      <Popover.Trigger>
        <Button
          variant="ghost"
          className="text-muted-foreground font-semibold px-1"
          size="sm"
        >
          <IconCalendarClock />
          {format(date, 'MMM dd')}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="p-0 max-w-none w-auto overflow-hidden">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => onChange(date as Date)}
        />
      </Popover.Content>
    </Popover>
  );
};
