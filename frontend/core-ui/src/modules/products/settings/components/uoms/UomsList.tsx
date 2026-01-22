import { IconDots, IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import {
  Button,
  InfoCard,
  Label,
  TextOverflowTooltip,
  ScrollArea,
  cn,
  Skeleton,
  DropdownMenu,
  Badge,
} from 'erxes-ui';
import { useState } from 'react';
import { useUoms } from '../../hooks/useUoms';
import { UomForm } from './UomForm';
import { useUomsRemove } from '../../hooks/useUomsRemove';

const UomsList = () => {
  const { uoms, loading } = useUoms();
  return (
    <InfoCard title="Uoms" className="relative">
      <UomForm
        trigger={
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-3 top-[2px]"
          >
            <IconPlus />
            Add Uom
          </Button>
        }
      />
      <InfoCard.Content className="p-0 relative">
        <div className="overflow-x-auto">
          <div className="flex gap-5 items-center pl-10 pr-4 h-9  bg-background rounded-t-lg">
            <Label className="flex-1 font-semibold">Name</Label>
            <Label className="flex-1 font-semibold">Code</Label>
          </div>
          <ScrollArea className="h-[30vh] w-full rounded-lg">
            <div className="shadow-xs rounded-lg mt-px">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <UomsListRowSkeleton key={i} />
                ))
              ) : uoms?.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <p>No Uoms found.</p>
                </div>
              ) : (
                uoms?.map((uom) => (
                  <div
                    className="flex gap-5 items-center h-9 hover:bg-foreground/10 pl-10 pr-4 first-of-type:rounded-t-lg last-of-type:rounded-b-lg border-b relative group"
                    key={uom._id}
                  >
                    <UomOptionMenu uom={uom} />
                    <div className="flex-1 min-w-0">
                      <Badge variant="secondary">
                        <TextOverflowTooltip
                          value={uom.name}
                          className="block truncate"
                        />
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <TextOverflowTooltip
                        value={uom.code}
                        className="block truncate"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};

export default UomsList;

const UomOptionMenu = ({ uom }: { uom: any }) => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { removeUoms } = useUomsRemove();
  return (
    <>
      <UomForm uom={uom} open={editOpen} onOpenChange={setEditOpen} />
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'absolute left-1 opacity-0 group-hover:opacity-100 size-6',
              open && 'opacity-100 bg-accent-foreground/10',
            )}
          >
            <IconDots />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          onClick={(e) => e.stopPropagation()}
          align="start"
          className="max-w-[400px] min-w-0"
        >
          <DropdownMenu.Item
            onClick={() => {
              setEditOpen(true);
            }}
          >
            <IconEdit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => {
              removeUoms({
                variables: { uomIds: [uom._id] },
                onCompleted: () => {
                  setOpen(false);
                },
              });
            }}
            className="text-destructive focus:text-destructive"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  );
};

export const UomsListRowSkeleton = () => {
  return (
    <div className="flex gap-5 items-center h-9 pl-10 pr-4 border-b bg-background">
      <div className="flex-1">
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex-1">
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
};
