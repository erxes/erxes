import {
  Button,
  Dialog,
} from 'erxes-ui';

import { IconX } from '@tabler/icons-react';


export const AccountingDialog = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  return (
    <Dialog.Content className="max-w-2xl">
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description className="sr-only">
          {description}
        </Dialog.Description>
        <Dialog.Close asChild>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-3"
          >
            <IconX />
          </Button>
        </Dialog.Close>
      </Dialog.Header>
      {children}
    </Dialog.Content>
  );
};