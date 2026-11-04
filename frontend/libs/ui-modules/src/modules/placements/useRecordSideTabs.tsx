import { useMemo } from 'react';
import type { IRecordSidePanelTab } from '../widget/record-side-panel/RecordSidePanel';
import { usePlacementContext } from './placementContext';
import { RecordContextProvider } from './recordContext';
import { useExtensions } from './useExtensions';

/** Every extension's `sideTabs` for this record, as record side panel tabs. */
export const useRecordSideTabs = ({
  contentType,
  contentId,
}: {
  contentType: string;
  contentId: string;
}) => {
  const extensions = useExtensions();
  const { Boundary } = usePlacementContext();

  return useMemo(
    () =>
      extensions.flatMap(({ pluginName, config }) =>
        (config.sideTabs ?? [])
          .filter((tab) =>
            tab.contentTypes.some((type) => type === contentType),
          )
          .map((tab): IRecordSidePanelTab => ({
            value: `extension:${pluginName}.${tab.name}`,
            label: tab.label,
            icon: tab.icon,
            content: (
              <RecordContextProvider value={{ contentType, contentId }}>
                <div className="flex flex-col flex-1 min-h-0">
                  <Boundary pluginName={pluginName}>
                    <tab.component
                      contentType={contentType}
                      contentId={contentId}
                    />
                  </Boundary>
                </div>
              </RecordContextProvider>
            ),
          })),
      ),
    [extensions, Boundary, contentType, contentId],
  );
};
