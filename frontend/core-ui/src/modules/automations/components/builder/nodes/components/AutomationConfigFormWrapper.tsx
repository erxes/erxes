import { Button } from 'erxes-ui';

export const AutomationCoreConfigFormWrapper = ({
  children,
  onSave,
}: {
  children: React.ReactNode;
  onSave: () => void;
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col gap-2 p-4 overflow-auto">
        {children}
      </div>
      <div className="p-2 flex justify-end border-t bg-white">
        <Button onClick={onSave}>Save Configuration</Button>
      </div>
    </div>
  );
};
