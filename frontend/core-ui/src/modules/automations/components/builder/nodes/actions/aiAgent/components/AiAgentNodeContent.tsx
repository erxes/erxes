import { useTranslation } from 'react-i18next';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomationOptionalConnect } from 'ui-modules';

export const AiAgentNodeContent = (
  props: NodeContentComponentProps<TAiAgentConfigForm>,
) => {
  const { goalType } = props.config || {};

  if (goalType === 'splitTopic') {
    return (
      <>
        <AiAgentClassifyTopic {...props} />
        <AiAgentMemorySummary config={props.config} />
      </>
    );
  }

  if (goalType === 'classification') {
    return (
      <>
        <AiAgentClassification {...props} />
        <AiAgentMemorySummary config={props.config} />
      </>
    );
  }

  if (goalType === 'generateText') {
    return (
      <>
        <AiAgentGenerateText {...props} />
        <AiAgentMemorySummary config={props.config} />
      </>
    );
  }

  return null;
};

const AiAgentMemorySummary = ({ config }: { config?: TAiAgentConfigForm }) => {
  const { t } = useTranslation('automations');
  const readEnabled = config?.memory?.read?.enabled;
  const writeEnabled = config?.memory?.write?.enabled;

  if (!readEnabled && !writeEnabled) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 px-2 pb-2">
      {readEnabled ? (
        <div className="rounded-xs bg-info/10 px-2 py-1 text-xs font-semibold text-info">
          {t('ai-agent-reads-memory')}
        </div>
      ) : null}
      {writeEnabled ? (
        <div className="rounded-xs bg-success/10 px-2 py-1 text-xs font-semibold text-success">
          {t('ai-agent-saves-memory', {
            key: config?.memory?.write?.key || 'result',
          })}
        </div>
      ) : null}
    </div>
  );
};

const AiAgentClassifyTopic = ({
  config,
  nodeData,
}: NodeContentComponentProps<TAiAgentConfigForm>) => {
  const OptionConnectHandle = useAutomationOptionalConnect({
    id: nodeData.id,
    flowDirection: nodeData.flowDirection,
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
  const { t } = useTranslation('automations');
  const { objectFields = [] } = (config || {}) as Extract<
    TAiAgentConfigForm,
    { goalType: 'classification' }
  >;

  if (!objectFields.length) {
    return <div>{t('ai-agent-classification')}</div>;
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
          {t('ai-agent-more-count', { count: objectFields.length - 3 })}
        </div>
      ) : null}
    </div>
  );
};

const AiAgentGenerateText = ({
  config,
  nodeData,
}: NodeContentComponentProps<TAiAgentConfigForm>) => {
  const { t } = useTranslation('automations');
  const OptionConnectHandle = useAutomationOptionalConnect({
    id: nodeData.id,
    flowDirection: nodeData.flowDirection,
  });
  const {
    prompt = '',
    captureFields = [],
    tools = [],
  } = (config || {}) as Extract<
    TAiAgentConfigForm,
    { goalType: 'generateText' }
  >;

  return (
    <>
      <div className="p-2">
        <div className="line-clamp-3 text-xs text-muted-foreground">
          {prompt || t('ai-agent-generate-text')}
        </div>
        {captureFields.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {captureFields.slice(0, 3).map(({ fieldName }) => (
              <div
                key={fieldName}
                className="rounded-xs bg-background p-2 text-xs font-semibold shadow"
              >
                {fieldName}
              </div>
            ))}
            {captureFields.length > 3 ? (
              <div className="rounded-xs bg-background p-2 text-xs font-semibold shadow">
                {t('ai-agent-more-count', {
                  count: captureFields.length - 3,
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {/* Every tool wires like a topic: the row carries a connect handle.
          Helpers run the wired workflow inline, handoffs route execution. */}
      {tools.map(({ id, name, kind }) => (
        <div
          key={`${id}-right`}
          className="relative bg-background shadow text-xs font-semibold rounded-xs m-2 p-2 text-mono"
        >
          {kind === 'helper' ? '🔧' : '→'} {name}
          <OptionConnectHandle optionalId={id} />
        </div>
      ))}
    </>
  );
};
