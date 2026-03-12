import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { TourCreateForm } from './TourCreateForm';

interface TourCreateSheetProps {
  branchId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export const TourCreateSheet = ({
  branchId,
  open,
  onOpenChange,
  showTrigger = true,
}: TourCreateSheetProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = typeof open === 'boolean';
  const sheetOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            Create tour
          </Button>
        </Sheet.Trigger>
      )}

      <Sheet.View className="w-[800px] sm:max-w-[800px] p-0">
        <TourCreateForm
          branchId={branchId}
          onSuccess={() => handleOpenChange(false)}
        />
      </Sheet.View>
    </Sheet>
  );
};
