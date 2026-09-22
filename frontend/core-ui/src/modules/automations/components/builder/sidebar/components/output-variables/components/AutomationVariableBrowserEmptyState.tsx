import { Empty } from 'erxes-ui';

export const AutomationVariableBrowserEmptyState = ({
  text,
}: {
  text: string;
}) => {
  return (
    <Empty className="gap-2 border p-3 md:p-3">
      <Empty.Description>{text}</Empty.Description>
    </Empty>
  );
};
