import { useAtomValue } from 'jotai';
import type { SlotProps, Slots } from 'erxes-ui';
import { usePermissionCheck } from '../permissions/hooks/usePermissionCheck';
import { pluginsConfigState } from '../../states/pluginsConfigState';
import { useSlotContext } from './slotContext';

/**
 * Renders what every plugin and installed extension put in this slot. Renders
 * nothing, not even the wrapper, when no plugin fills it.
 */
export const Slot = <N extends keyof Slots>({
  name,
  props,
  className,
}: {
  name: N;
  props: SlotProps<N>;
  className?: string;
}) => {
  const plugins = useAtomValue(pluginsConfigState);
  const { isLoaded, isWildcard, hasPluginPermission } = usePermissionCheck();
  const { RenderRemote } = useSlotContext();

  if (!plugins || !isLoaded) {
    return null;
  }

  const fills = Object.values(plugins).flatMap((plugin) => {
    const expose = plugin.slots?.[name];

    if (!expose || (!isWildcard && !hasPluginPermission(plugin.name))) {
      return [];
    }

    return [{ pluginName: plugin.name, expose }];
  });

  if (!fills.length) {
    return null;
  }

  return (
    <div className={className}>
      {fills.map(({ pluginName, expose }) => (
        <RenderRemote
          key={`${pluginName}/${expose}`}
          pluginName={pluginName}
          expose={expose}
          props={props}
        />
      ))}
    </div>
  );
};
