import { useAtomValue } from 'jotai';
import type { RecordContentType } from 'erxes-ui';
import { usePermissionCheck } from '../permissions/hooks/usePermissionCheck';
import { pluginsConfigState } from '../../states/pluginsConfigState';
import { RecordSelectionProvider } from './recordContext';
import { useSlotContext } from './slotContext';

/**
 * Renders every plugin's and extension's `recordActions` for this record type.
 * Detail pages pass the open record, bulk bars the selected rows. Renders
 * nothing, not even `leading`, when no plugin adds actions.
 */
export const RecordActions = ({
  contentType,
  contentIds,
  leading,
  className,
}: {
  contentType: RecordContentType;
  contentIds: string[];
  leading?: React.ReactNode;
  className?: string;
}) => {
  const plugins = useAtomValue(pluginsConfigState);
  const { isLoaded, isWildcard, hasPluginPermission } = usePermissionCheck();
  const { RenderRemote } = useSlotContext();

  if (!plugins || !isLoaded || !contentIds.length) {
    return null;
  }

  const fills = Object.values(plugins).flatMap((plugin) => {
    const expose = plugin.recordActions?.[contentType];

    if (!expose || (!isWildcard && !hasPluginPermission(plugin.name))) {
      return [];
    }

    return [{ pluginName: plugin.name, expose }];
  });

  if (!fills.length) {
    return null;
  }

  return (
    <RecordSelectionProvider value={{ contentType, contentIds }}>
      {leading}
      <div className={className ?? 'flex items-center gap-2'}>
        {fills.map(({ pluginName, expose }) => (
          <RenderRemote
            key={`${pluginName}/${expose}`}
            pluginName={pluginName}
            expose={expose}
            props={{}}
          />
        ))}
      </div>
    </RecordSelectionProvider>
  );
};
