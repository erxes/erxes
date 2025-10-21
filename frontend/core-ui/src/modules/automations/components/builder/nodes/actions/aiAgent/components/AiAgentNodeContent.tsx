import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomationOptionalConnect } from 'ui-modules/modules/automations/hooks/useAutomationOptionalConnect';

export const AiAgentNodeContent = (
  props: NodeContentComponentProps<TAiAgentConfigForm>,
) => {
  const { goalType } = props.config || {};
  if (goalType === 'classifyTopic') {
    return <AiAgentClassifyTopic {...props} />;
  }

  if (goalType === 'generateObject') {
    return <div>Generate Object</div>;
  }

  if (goalType === 'generateText') {
    return <div>Generate Text</div>;
  }

  return null;
};

const AiAgentClassifyTopic = ({
  config,
  nodeData,
}: NodeContentComponentProps<TAiAgentConfigForm>) => {
  const OptionConnectHandle = useAutomationOptionalConnect({
    id: nodeData.id,
  });
  const { topics = [] } = (config || {}) as Extract<
    TAiAgentConfigForm,
    { goalType: 'classifyTopic' }
  >;
  return topics.map(({ id, topicName }) => (
    <div
      key={`${id}-right`}
      className="relative bg-background shadow text-xs font-semibold rounded-xs m-2 p-2 text-mono"
    >
      {topicName}

      <OptionConnectHandle optionalId={id} />
    </div>
  ));
};
