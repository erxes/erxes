import { useTranslation } from 'react-i18next';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomationOptionalConnect } from 'ui-modules';
import { useSplitNodeIssues } from '../hooks/useSplitNodeIssues';
import { TSplitConditionsConfigForm } from '../states/splitConditionsConfigForm';

const FALLBACK_OPTION_ID = 'fallback';

export const SplitConditionsNodeConfig = ({
  config,
  nodeData,
}: NodeContentComponentProps<TSplitConditionsConfigForm>) => {
  const { t } = useTranslation('automations');
  const OptionConnectHandle = useAutomationOptionalConnect({
    id: nodeData.id,
    flowDirection: nodeData.flowDirection,
  });
  const { options = [] } = config || {};

  useSplitNodeIssues(config);

  return (
    <>
      {!options.length && (
        <div className="line-clamp-3 p-2 text-xs text-muted-foreground">
          {t('split-configure-options')}
        </div>
      )}
      {options.map(({ id, label }) => (
        <div
          key={`${id}-right`}
          className="relative m-2 rounded-xs bg-background p-2 text-xs font-semibold text-mono shadow"
        >
          {label}
          <OptionConnectHandle optionalId={id} />
        </div>
      ))}
      <div className="relative m-2 flex items-center gap-2 rounded-xs border border-dashed border-muted-foreground/30 bg-muted/40 p-2 text-xs font-semibold text-muted-foreground">
        <span className="text-mono">{t('split-fallback')}</span>
        <OptionConnectHandle optionalId={FALLBACK_OPTION_ID} />
      </div>
    </>
  );
};
