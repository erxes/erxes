import { IconShieldCheck } from '@tabler/icons-react';

import { Card } from 'erxes-ui';

type Props = {
  clientName?: string;
};

export const DeviceAuthorizeApproved = ({ clientName }: Props) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-10">
      <Card className="w-full max-w-xl rounded-lg border">
        <Card.Content className="space-y-4 px-8 py-10 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <IconShieldCheck className="size-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Access granted</h1>
            <p className="text-sm text-muted-foreground">
              {clientName || 'This application'} can now use the permissions you
              approved. You can return to erxes-local.
            </p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};
