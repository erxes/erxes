import { IconCashRegister, IconSettings } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';

interface PosEmptyStateProps {
  isCreate?: boolean;
  onCreatePos?: () => void;
}

export const PosEmptyState = ({
  isCreate,
  onCreatePos,
}: PosEmptyStateProps) => {
  return (
    <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
      <IconCashRegister
        size={64}
        stroke={1.5}
        className="text-muted-foreground"
      />
      <h2 className="text-lg font-semibold text-muted-foreground">
        No POS yet
      </h2>
      <p className="mb-4 text-md text-muted-foreground">
        Create a POS to start managing your sales.
      </p>
      {isCreate ? (
        <Button variant="default" onClick={onCreatePos}>
          Create POS
        </Button>
      ) : (
        <Button variant="outline" asChild>
          <Link to="/settings/pos">
            <IconSettings />
            Go to settings
          </Link>
        </Button>
      )}
    </div>
  );
};
