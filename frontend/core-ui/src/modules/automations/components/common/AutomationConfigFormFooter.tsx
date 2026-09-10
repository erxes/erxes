import { IconLoader2 } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

export const AutoamtionConfigFormFooter = ({
  label = 'Save Configuration',
  onSave,
  disabledToSave,
  saving,
}: {
  onSave: () => void;
  label?: string;
  disabledToSave?: boolean;
  saving?: boolean;
}) => {
  return (
    <div className="shrink-0 border-t bg-background p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex justify-end">
      <Button disabled={disabledToSave || saving} onClick={onSave}>
        {saving ? (
          <>
            <IconLoader2 className="animate-spin" />
            Saving...
          </>
        ) : (
          label
        )}
      </Button>
    </div>
  );
};
