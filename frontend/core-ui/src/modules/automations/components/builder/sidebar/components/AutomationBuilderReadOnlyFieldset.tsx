import { useAutomation } from '@/automations/context/AutomationProvider';

export const AutomationBuilderReadOnlyFieldset = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isReadOnly } = useAutomation();

  if (!isReadOnly) {
    return <>{children}</>;
  }

  return (
    <fieldset disabled className="min-w-0 border-0 p-0 [&_*]:cursor-default">
      {children}
    </fieldset>
  );
};
