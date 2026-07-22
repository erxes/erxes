import { ReactNode } from 'react';
import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';
import { Dialog } from 'erxes-ui/components/dialog';

type Props = {
  logo: string;
  title: string;
  description: string;
  hasConfig: boolean;
  loading?: boolean;
  error?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectedContent: ReactNode;
  form: ReactNode;
};

const GatewayCard = ({
  logo,
  title,
  description,
  hasConfig,
  loading = false,
  error = false,
  open,
  onOpenChange,
  connectedContent,
  form,
}: Props) => {
  let statusContent: ReactNode;

  if (loading) {
    statusContent = (
      <p className="text-sm text-muted-foreground">
        Loading configuration...
      </p>
    );
  } else if (error) {
    statusContent = (
      <p className="text-sm text-destructive">
        Failed to load configuration.
      </p>
    );
  } else if (hasConfig) {
    statusContent = (
      <>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">Connected</span>
        </div>
        {connectedContent}
      </>
    );
  } else {
    statusContent = (
      <>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gray-400" />
          <span className="text-sm font-medium">Not connected</span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </>
    );
  }

  return (
    <>
      <Card className="space-y-4 p-4">
        {/* ... */}
        <div className="space-y-3">
          {statusContent}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>
              {hasConfig ? 'Manage' : 'Add'} {title}
            </Dialog.Title>
          </Dialog.Header>
          {form}
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export default GatewayCard;
