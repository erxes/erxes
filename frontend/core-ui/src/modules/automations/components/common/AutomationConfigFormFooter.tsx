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
    <div className="p-2 flex justify-end border-t bg-background">
      <Button disabled={disabledToSave} onClick={onSave}>
        {label}
      </Button>
    </div>
  );
};
