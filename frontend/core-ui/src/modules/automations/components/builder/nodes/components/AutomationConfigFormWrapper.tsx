import { AutoamtionConfigFormFooter } from '@/automations/components/common/AutomationConfigFormFooter';

export const AutomationConfigFormWrapper = ({
  children,
  onSave,
  disabledToSave,
}: {
  children: React.ReactNode;
  onSave: () => void;
  disabledToSave?: boolean;
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col gap-2 p-4 overflow-auto">
        {children}
      </div>
      <AutoamtionConfigFormFooter
        disabledToSave={disabledToSave}
        onSave={onSave}
      />
    </div>
  );
};
