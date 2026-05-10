import { Button } from 'erxes-ui';

export const AutoamtionConfigFormFooter = ({
  onSave,
}: {
  onSave: () => void;
}) => {
  return (
    <div className="p-2 flex justify-end border-t bg-background">
      <Button onClick={onSave}>Save Configuration</Button>
    </div>
  );
};
