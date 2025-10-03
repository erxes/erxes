import { AddProperty } from '@/settings/properties/components/add/AddProperty';
import { AddPropertyGroup } from '@/settings/properties/components/add/AddPropertyGroup';
import { IconPlus } from '@tabler/icons-react';
import { Button, DropdownMenu, Kbd } from 'erxes-ui';
import React from 'react';

export const PropertiesCommandMenuTrigger = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <Button>
          <IconPlus />
          Add Group & Field
          <Kbd>C</Kbd>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="min-w-[--radix-dropdown-menu-trigger-width]">
        <AddProperty />
        <AddPropertyGroup />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
