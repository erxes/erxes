import { AutomationActionNodeConfigProps } from 'ui-modules';

export const ActionCommentConfigContent = ({
  config,
}: AutomationActionNodeConfigProps<any>) => {
  const { text = '' } = config || {};
  return <div className="p-2">{text}</div>;
};
