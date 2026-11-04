import { IconDots } from '@tabler/icons-react';
import { Button, Popover, Tooltip, type RecordContentType } from 'erxes-ui';
import { useMemo } from 'react';
import { usePlacementContext } from './placementContext';
import { RecordSelectionProvider } from './recordContext';
import { useExtensions } from './useExtensions';

const useRecordActionComponents = (contentType: RecordContentType) => {
  const extensions = useExtensions();

  return useMemo(
    () =>
      extensions.flatMap(({ pluginName, config }) => {
        const component = config.recordActions?.[contentType];
        return component ? [{ pluginName, Component: component }] : [];
      }),
    [extensions, contentType],
  );
};

/**
 * Every extension's `recordActions` for these records. Renders nothing, not
 * even `leading`, when no extension adds actions.
 */
export const RecordActions = ({
  contentType,
  contentIds,
  leading,
  className = 'flex items-center gap-2',
}: {
  contentType: RecordContentType;
  contentIds: string[];
  leading?: React.ReactNode;
  className?: string;
}) => {
  const actions = useRecordActionComponents(contentType);
  const { Boundary } = usePlacementContext();

  if (!actions.length || !contentIds.length) {
    return null;
  }

  return (
    <RecordSelectionProvider value={{ contentType, contentIds }}>
      {leading}
      <div className={className}>
        {actions.map(({ pluginName, Component }) => (
          <Boundary key={pluginName} pluginName={pluginName}>
            <Component />
          </Boundary>
        ))}
      </div>
    </RecordSelectionProvider>
  );
};

/** The open record's actions, behind one button in the record side panel's header. */
export const RecordActionsMenu = ({
  contentType,
  contentId,
}: {
  contentType: RecordContentType;
  contentId: string;
}) => {
  const actions = useRecordActionComponents(contentType);

  if (!actions.length || !contentId) {
    return null;
  }

  return (
    <Popover>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Popover.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Actions"
            >
              <IconDots className="size-4" />
            </Button>
          </Popover.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Content>Actions</Tooltip.Content>
      </Tooltip>
      <Popover.Content align="end" className="w-auto p-2">
        <RecordActions
          contentType={contentType}
          contentIds={[contentId]}
          className="flex flex-col items-stretch gap-2"
        />
      </Popover.Content>
    </Popover>
  );
};
