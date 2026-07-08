import { Button } from 'erxes-ui';

export const AutoamtionConfigFormFooter = ({
  label = 'Save Configuration',
  onSave,
  disabledToSave,
}: {
  onSave: () => void;
  label?: string;
  disabledToSave?: boolean;
}) => {
  return (
    <div className="shrink-0 border-t bg-background p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex justify-end">
      <Button disabled={disabledToSave} onClick={onSave}>
        {label}
      </Button>
    </div>
  );
};
