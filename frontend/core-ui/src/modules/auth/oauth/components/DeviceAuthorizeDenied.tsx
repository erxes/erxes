import { IconX } from '@tabler/icons-react';

import { Card } from 'erxes-ui';

export const DeviceAuthorizeDenied = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-10">
      <Card className="w-full max-w-xl rounded-lg border">
        <Card.Content className="space-y-4 px-8 py-10 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <IconX className="size-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Request canceled</h1>
            <p className="text-sm text-muted-foreground">
              The application was not granted access to your workspace.
            </p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};
