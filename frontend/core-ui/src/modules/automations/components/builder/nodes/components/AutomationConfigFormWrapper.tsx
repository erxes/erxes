import { AutoamtionConfigFormFooter } from '@/automations/components/common/AutomationConfigFormFooter';

export const AutomationConfigFormWrapper = ({
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
      <AutoamtionConfigFormFooter onSave={onSave} />
    </div>
  );
};
