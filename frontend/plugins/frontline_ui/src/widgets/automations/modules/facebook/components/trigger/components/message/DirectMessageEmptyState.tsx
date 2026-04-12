import { IconMessageSearch } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

export const DirectMessageEmptyState = ({
  onAddFirstCondition,
}: {
  onAddFirstCondition: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-10 text-center">
      <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">
        <IconMessageSearch className="size-5" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium">No direct message conditions yet</p>
        <p className="text-xs text-muted-foreground">
          Leave this empty to trigger on any direct text message, or add
          conditions to match specific keywords.
        </p>
      </div>

      <Button className="mt-4" onClick={onAddFirstCondition}>
        Add optional condition
      </Button>
    </div>
  );
};
