import { parseAsBoolean, useQueryState } from 'nuqs';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  type ComponentType,
  type PropsWithChildren,
  useContext,
  useLayoutEffect,
  useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router-dom';
import { usePluginText } from '~/modules/plugins/pluginText';
import { PanelRecordOpener } from './PanelRecordOpener';
import { useRecordPageNavigation } from './panelNavigation';
import { recordPagePath, usePanelRecordType } from './panelRecordTypes';
import { type RecordPanelControls, RecordPanelProvider, Spinner } from 'erxes-ui';
import { RecordSidePanel } from './RecordSidePanel';
import { SidePanelEmpty } from './SidePanelEmpty';
import {
  type IRecordViewProps,
  SidePanelNavigatorContext,
  SidePanelRecordPathContext,
} from './recordView';
import { SidePanelRecordStack } from './SidePanelRecordStack';
import { NEW_RECORD_ID, SIDE_PANEL_ROOT_PATH } from './sidePanelPaths';
import { sidePanelWidthState, useSidePanel } from './useSidePanel';

// A record not created yet: its draft, saved as the record on Save.
const SidePanelDraft = ({
  record,
  onBack,
  onClose,
  label,
  newTitle,
  plugin,
  New,
}: IRecordViewProps & {
  label: string;
  newTitle?: string;
  plugin?: string;
  New: ComponentType<{ contentType: string }>;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const text = usePluginText();

  const words = (value: string) =>
    plugin ? text(plugin, value) : t(`record-types.${value}`, value);

  return (
    <>
      <RecordSidePanel.Header
        title={
          newTitle
            ? words(newTitle)
            : t('new-record', 'New {{type}}', { type: words(label).toLowerCase() })
        }
        onBack={onBack}
        onClose={onClose}
      />
      <div className="flex flex-1 min-h-0 flex-col">
        <New contentType={record.contentType} />
      </div>
    </>
  );
};

/** A link to no record: an unknown type, a plugin that isn't installed, a type without drafts. */
const SidePanelNotFound = ({ onBack, onClose }: Omit<IRecordViewProps, 'record'>) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    <SidePanelEmpty
      title={t('not-found-title', 'Nothing here')}
      description={t('not-found-description', 'This panel link does not point to a record.')}
      onBack={onBack}
      onClose={onClose}
    />
  );
};

/**
 * What the record's slots may do to it (erxes-ui's `useRecordPanel`): its tab, and closing,
 * dismissing or replacing it, in the panel or on its own page.
 */
const RecordPanelScope = ({
  record,
  onClose,
  children,
}: PropsWithChildren<Pick<IRecordViewProps, 'record' | 'onClose'>>) => {
  const entryPath = useContext(SidePanelRecordPathContext);
  const { tab, setTab, close, dismissPath, replaceRecord } = useSidePanel();
  const navigator = useContext(SidePanelNavigatorContext);

  const controls = useMemo<RecordPanelControls>(
    () => ({
      record,
      tab,
      setTab,
      close: onClose ?? close,
      dismiss: () => {
        if (navigator) navigator.close();
        else if (entryPath) dismissPath(entryPath);
        else close();
      },
      replace: (next) => (navigator ? navigator.replaceRecord(next) : replaceRecord(record, next)),
    }),
    [record, tab, setTab, onClose, close, navigator, entryPath, dismissPath, replaceRecord],
  );

  return <RecordPanelProvider value={controls}>{children}</RecordPanelProvider>;
};

/**
 * A record as the side panel shows it, or its draft: core's, or a plugin's. A record's own
 * page draws it too, expanded (`RecordPage`).
 */
export const SidePanelRecord = (props: IRecordViewProps) => {
  const { type, loading } = usePanelRecordType(props.record.contentType);
  const isNew = props.record.contentId === NEW_RECORD_ID;

  if (loading) {
    return (
      <>
        <RecordSidePanel.Header title="" onBack={props.onBack} onClose={props.onClose} />
        <Spinner area="lg" />
      </>
    );
  }

  if (!type || (isNew && !type.New)) {
    return <SidePanelNotFound onBack={props.onBack} onClose={props.onClose} />;
  }

  // A record opened from inside this one goes on top of it, so Back returns here.
  return (
    <PanelRecordOpener stack>
      {isNew && type.New ? (
        <SidePanelDraft
          {...props}
          label={type.label}
          newTitle={type.newTitle}
          plugin={type.plugin}
          New={type.New}
        />
      ) : (
        <RecordPanelScope record={props.record} onClose={props.onClose}>
          <type.View {...props} />
        </RecordPanelScope>
      )}
    </PanelRecordOpener>
  );
};

// How many app-wide panels are mounted (MainLayout). While none is, an app
// can draw its own (`fallback`) so records still open beside its pages.
const sidePanelHostCountState = atom(0);

/**
 * The app-wide side panel: a column right of the page. What it shows is its
 * own route, kept in the `panel` query param (`?panel=/detail/customer/<id>`),
 * so it can be linked and reloaded. `fallback` draws it only while no
 * app-wide one is mounted.
 */
export const SidePanelLayout = ({ fallback = false }: { fallback?: boolean }) => {
  const hostCount = useAtomValue(sidePanelHostCountState);
  const setHostCount = useSetAtom(sidePanelHostCountState);

  useLayoutEffect(() => {
    if (fallback) return undefined;

    setHostCount((count) => count + 1);

    return () => setHostCount((count) => count - 1);
  }, [fallback, setHostCount]);

  if (fallback && hostCount > 0) return null;

  return <SidePanelColumn />;
};

/** The open record's stack, or why there is none. */
const SidePanelRoute = () => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { path, history, record, close, canGoBack, back } = useSidePanel();

  if (record) {
    return (
      <SidePanelRecordStack
        path={path || ''}
        history={history}
        View={SidePanelRecord}
        onBack={canGoBack ? back : undefined}
        onClose={close}
      />
    );
  }

  if (path === SIDE_PANEL_ROOT_PATH) {
    return (
      <SidePanelEmpty
        title={t('empty-title', 'Nothing open')}
        description={t(
          'empty-description',
          'Open a record to see it and everything related to it here.',
        )}
        onClose={close}
      />
    );
  }

  return (
    <SidePanelEmpty
      title={t('not-found-title', 'Nothing here')}
      description={t('not-found-description', 'This panel link does not point to a record.')}
      onClose={close}
    />
  );
};

const SidePanelColumn = () => {
  const { open, record, tab } = useSidePanel();
  const [width, setWidth] = useAtom(sidePanelWidthState);
  const [expanded] = useQueryState('panelExpanded', parseAsBoolean);
  const { pathname } = useLocation();
  const { openPage } = useRecordPageNavigation();
  const { type } = usePanelRecordType(record?.contentType ?? '');

  // Saved records expand into their own pages.
  const recordPage = record ? recordPagePath(type, record, pathname) : null;

  return (
    <>
      {/* Links saved while records still expanded in place. */}
      {recordPage && expanded && <Navigate to={recordPage} replace />}
      {open && !(recordPage && expanded) && (
        <RecordSidePanel
          key="record"
          expanded={false}
          expandable={Boolean(recordPage)}
          // The page opens on the tab the panel shows, and collapses back here.
          onExpandedChange={() => {
            if (recordPage) openPage(recordPage, tab);
          }}
          width={width}
          onWidthChange={setWidth}
        >
          <SidePanelRoute />
        </RecordSidePanel>
      )}
    </>
  );
};
