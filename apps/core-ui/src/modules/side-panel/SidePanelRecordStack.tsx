import { useAtomValue } from 'jotai';
import { type ComponentType, useState } from 'react';
import { sidePanelHistoryState } from './panelNavigation';
import { type IRecordViewProps, SidePanelRecordPathContext } from './recordView';
import { parseSidePanelRecord } from './sidePanelPaths';
import { SidePanelDraftContext, sidePanelDraftState, sidePanelSessionState } from './useSidePanel';

/** Retains one view with the draft defaults it was opened with. */
const RecordEntry = ({
  active,
  View,
  entryPath,
  ...props
}: IRecordViewProps & {
  active: boolean;
  View: ComponentType<IRecordViewProps>;
  entryPath: string;
}) => {
  const currentDraft = useAtomValue(sidePanelDraftState);
  const [draft] = useState(() => currentDraft);

  return (
    <div
      hidden={!active}
      aria-hidden={!active}
      inert={!active}
      className={active ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}
    >
      <SidePanelDraftContext.Provider value={draft}>
        <SidePanelRecordPathContext.Provider value={entryPath}>
          <View {...props} />
        </SidePanelRecordPathContext.Provider>
      </SidePanelDraftContext.Provider>
    </div>
  );
};

// Keep the views on the navigation stack mounted so returning from a linked
// record restores the form, selected tab and scroll position.
export const SidePanelRecordStack = ({
  path,
  View,
  onBack,
  onClose,
  history: providedHistory,
}: {
  path: string;
  View: ComponentType<IRecordViewProps>;
  onBack?: () => void;
  onClose: () => void;
  history?: string[];
}) => {
  const storedHistory = useAtomValue(sidePanelHistoryState);
  const history = providedHistory ?? storedHistory;
  const session = useAtomValue(sidePanelSessionState);
  const [stack, setStack] = useState(() => ({ path, session, paths: [...history, path] }));

  // History and the router can notify separately. Do not prune mounted views
  // until the destination URL arrives, or Back could briefly remove its form.
  if (stack.path !== path || stack.session !== session) {
    setStack({ path, session, paths: [...history, path] });
  }

  const occurrences = new Map<string, number>();

  return (
    <>
      {stack.paths.map((entry, index) => {
        const occurrence = occurrences.get(entry) ?? 0;

        occurrences.set(entry, occurrence + 1);

        const record = parseSidePanelRecord(entry);

        if (!record) return null;

        return (
          <RecordEntry
            key={JSON.stringify([session, entry, occurrence])}
            active={index === stack.paths.length - 1}
            View={View}
            record={record}
            entryPath={entry}
            onBack={onBack}
            onClose={onClose}
          />
        );
      })}
    </>
  );
};
