import { IconChevronDown } from '@tabler/icons-react';
import { Button, Collapsible } from 'erxes-ui';
import { useState } from 'react';

export const ProgressByAssignee = () => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible
      defaultOpen={open}
      onOpenChange={setOpen}
      className="group/collapsible-sub-menu"
    >
      <div>Progress by assignee</div>
      <Collapsible.Content>
        <div>Progress 2 by assignee</div>
      </Collapsible.Content>
      <Collapsible.Trigger asChild>
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(!open)}
            className="mx-auto hover:bg-transparent hover:text-muted-foreground"
          >
            <IconChevronDown className="transition-transform group-data-[state=open]/collapsible-sub-menu:rotate-180 size-3.5" />
          </Button>
        </div>
      </Collapsible.Trigger>
    </Collapsible>
  );
};
