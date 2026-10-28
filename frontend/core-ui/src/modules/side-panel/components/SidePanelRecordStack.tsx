import { useAtomValue } from 'jotai';
import { ComponentType, useState } from 'react';
import {
  IRecordViewProps,
  parseSidePanelRecord,
  SidePanelDraftContext,
  SidePanelRecordPathContext,
  sidePanelDraftState,
  sidePanelHistoryState,
  sidePanelSessionState,
} from 'ui-modules';
import {
  getModulePanelRecordView,
  isModulePanelPath,
} from '@/side-panel/states/modulePanelState';
import { CoreModulePanelSlot } from '@/side-panel/components/CoreModulePanelSlot';
import { PanelRecordContext } from '@/side-panel/contexts/PanelRecordContext';

const RecordEntry = ({
  active,
  View,
  initialTab,
  entryPath,
  ...props
}: IRecordViewProps & {
  active: boolean;
  View: ComponentType<IRecordViewProps>;
  initialTab?: string;
  entryPath: string;
}) => {
  const currentDraft = useAtomValue(sidePanelDraftState);
  const [draft] = useState(() => currentDraft);

  return (
    <div
      hidden={!active}
      aria-hidden={!active}
      {...(!active ? { inert: '' } : {})}
      className={active ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}
    >
      <SidePanelDraftContext.Provider value={draft}>
        <SidePanelRecordPathContext.Provider value={entryPath}>
          <PanelRecordContext.Provider
            value={{
              ...props.record,
              tab: initialTab,
              draftId:
                props.record.contentId === 'new'
                  ? entryPath.split('/').at(-1)
                  : undefined,
            }}
          >
            <View {...props} />
          </PanelRecordContext.Provider>
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
  const [stack, setStack] = useState(() => ({
    path,
    session,
    paths: [...history, path],
  }));
  // History and the router can notify separately. Do not prune mounted views
  // until the destination URL arrives, or Back could briefly remove its form.
  if (stack.path !== path || stack.session !== session) {
    setStack({ path, session, paths: [...history, path] });
  }
  const paths = stack.paths;

  return (
    <>
      {paths.map((entry, index) => {
        const record = parseSidePanelRecord(entry);
        if (!record)
          return isModulePanelPath(entry) ? (
            <div
              key={`${session}:${index}:${entry}`}
              hidden={index !== paths.length - 1}
              aria-hidden={index !== paths.length - 1}
              {...(index !== paths.length - 1 ? { inert: '' } : {})}
              className={
                index === paths.length - 1
                  ? 'flex min-h-0 flex-1 flex-col'
                  : 'hidden'
              }
            >
              <CoreModulePanelSlot path={entry} onClose={onClose} />
            </div>
          ) : null;

        return (
          <RecordEntry
            key={`${session}:${index}:${entry}`}
            active={index === paths.length - 1}
            View={View}
            record={record}
            entryPath={entry}
            initialTab={
              paths
                .slice(index + 1)
                .map(getModulePanelRecordView)
                .find(
                  (view) =>
                    view?.contentType === record.contentType &&
                    view.contentId === record.contentId &&
                    (record.contentId !== 'new' ||
                      view.draftId === entry.split('/').at(-1)),
                )?.tab
            }
            onBack={onBack}
            onClose={onClose}
          />
        );
      })}
    </>
  );
};
