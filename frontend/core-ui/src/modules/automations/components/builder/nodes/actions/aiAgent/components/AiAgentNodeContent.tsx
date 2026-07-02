import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomationOptionalConnect } from 'ui-modules';
import { useTranslation } from 'react-i18next';

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
          {t('reads-memory', 'reads memory')}
        </div>
      ) : null}
      {writeEnabled ? (
        <div className="rounded-xs bg-success/10 px-2 py-1 text-xs font-semibold text-success">
          {t('saves-result', 'saves')} {config?.memory?.write?.key || t('result', 'result')}
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
    return <div>{t('classification', 'Classification')}</div>;
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
  const { t } = useTranslation('automations');
  const { prompt = '' } = (config || {}) as Extract<
    TAiAgentConfigForm,
    { goalType: 'generateText' }
  >;

  return (
    <div className="line-clamp-3 p-2 text-xs text-muted-foreground">
      {prompt || t('generate-text', 'Generate text')}
    </div>
  );
};
