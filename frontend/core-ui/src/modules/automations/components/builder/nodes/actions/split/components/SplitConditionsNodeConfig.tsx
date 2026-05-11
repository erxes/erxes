import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomationOptionalConnect } from 'ui-modules';
import { TSplitConditionsConfigForm } from '../states/splitConditionsConfigForm';

const FALLBACK_OPTION_ID = 'fallback';

export const SplitConditionsNodeConfig = ({
  config,
  nodeData,
}: NodeContentComponentProps<TSplitConditionsConfigForm>) => {
  const OptionConnectHandle = useAutomationOptionalConnect({
    id: nodeData.id,
  });
  const { options = [] } = config || {};

  return (
    <>
      {!options.length && (
        <div className="line-clamp-3 p-2 text-xs text-muted-foreground">
          Configure split options
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
        <span className="text-mono">Fallback</span>
        <OptionConnectHandle optionalId={FALLBACK_OPTION_ID} />
      </div>
    </>
  );
};
