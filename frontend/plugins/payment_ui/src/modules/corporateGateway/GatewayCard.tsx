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
  return (
    <>
      <Card className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt={title}
              className="h-10 w-10 rounded-md object-contain"
            />

            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">(Accepts MNT)</p>
            </div>
          </div>

          <Button variant="link" size="sm" onClick={() => onOpenChange(true)}>
            {hasConfig ? 'Manage' : '+ Add'}
          </Button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading configuration...
            </p>
          ) : error ? (
            <p className="text-sm text-destructive">
              Failed to load configuration.
            </p>
          ) : hasConfig ? (
            <>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Connected</span>
              </div>

              {connectedContent}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-400" />
                <span className="text-sm font-medium">Not connected</span>
              </div>

              <p className="text-sm text-muted-foreground">{description}</p>
            </>
          )}
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
