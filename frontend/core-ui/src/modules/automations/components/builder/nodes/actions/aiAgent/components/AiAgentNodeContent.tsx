import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomationOptionalConnect } from 'ui-modules';

export const AiAgentNodeContent = (
  props: NodeContentComponentProps<TAiAgentConfigForm>,
) => {
  const { goalType } = props.config || {};
  if (goalType === 'splitTopic') {
    return <AiAgentClassifyTopic {...props} />;
  }

  if (goalType === 'classification') {
    return <AiAgentClassification {...props} />;
  }

  if (goalType === 'generateText') {
    return <AiAgentGenerateText {...props} />;
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
    { goalType: 'splitTopic' }
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

const AiAgentClassification = ({
  config,
}: NodeContentComponentProps<TAiAgentConfigForm>) => {
  const { objectFields = [] } = (config || {}) as Extract<
    TAiAgentConfigForm,
    { goalType: 'classification' }
  >;

  if (!objectFields.length) {
    return <div>Classification</div>;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {objectFields.slice(0, 3).map(({ fieldName }) => (
        <div
          key={fieldName}
          className="rounded-xs bg-background p-2 text-xs font-semibold shadow"
        >
          {fieldName}
        </div>
      ))}
      {objectFields.length > 3 ? (
        <div className="rounded-xs bg-background p-2 text-xs font-semibold shadow">
          +{objectFields.length - 3} more
        </div>
      ) : null}
    </div>
  );
};

const AiAgentGenerateText = ({
  config,
}: NodeContentComponentProps<TAiAgentConfigForm>) => {
  const { prompt = '' } = (config || {}) as Extract<
    TAiAgentConfigForm,
    { goalType: 'generateText' }
  >;

  return (
    <div className="line-clamp-3 p-2 text-xs text-muted-foreground">
      {prompt || 'Generate text'}
    </div>
  );
};
