import { useState } from 'react';

import { IconChevronDown } from '@tabler/icons-react';

import { Button, Collapsible } from 'erxes-ui';

export const ProductAddCollapsible = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Collapsible
      className="flex flex-col items-center my-5"
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <Collapsible.Content className="order-1 w-full">
        {children}
      </Collapsible.Content>
      <Collapsible.Trigger asChild>
        <Button variant="secondary" size="sm">
          {!isOpen ? 'Fill in more info' : 'See less'}
          <IconChevronDown
            size={12}
            strokeWidth={2}
            className={` ${isOpen && 'rotate-180'}`}
          />
        </Button>
      </Collapsible.Trigger>
    </Collapsible>
  );
};
