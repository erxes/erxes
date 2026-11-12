import { useQueryState } from 'erxes-ui';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  getContactDetailPath,
  isContactContentType,
} from '~/modules/contacts/utils/contactDetailPath';
import { CompanyPanelNew } from './details/CompanyPanelNew';
import { CustomerPanelNew } from './details/CustomerPanelNew';
import { RecordSidePanel } from './RecordSidePanel';
import type { IRecordViewProps } from './recordView';
import { SidePanelEmpty } from './SidePanelEmpty';
import { SidePanelRecordStack } from './SidePanelRecordStack';
import { SidePanelSavedRecord } from './SidePanelSavedRecord';
import { NEW_RECORD_ID, SIDE_PANEL_ROOT_PATH } from './sidePanelPaths';
import { sidePanelWidthState, useSidePanel } from './useSidePanel';

// `sales:deal` reads as "Deal".
const getContentTypeLabel = (contentType: string) => {
  const name = contentType.split(':').pop() || contentType;

  return name.charAt(0).toUpperCase() + name.slice(1);
};

// A record not created yet: its draft, saved as the record on Save.
const SidePanelDraft = ({ record, onBack, onClose }: IRecordViewProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    <>
      <RecordSidePanel.Header
        title={t('new-record', 'New {{type}}', {
          type: getContentTypeLabel(record.contentType).toLowerCase(),
        })}
        onBack={onBack}
        onClose={onClose}
      />
      <div className="flex flex-1 min-h-0 flex-col">
        {record.contentType === 'core:customer' ? <CustomerPanelNew /> : <CompanyPanelNew />}
      </div>
    </>
  );
};

/**
 * A record as the side panel shows it, or its draft. A record's own page
 * draws it too, expanded (`ContactDetailPage`).
 */
export const SidePanelRecord = (props: IRecordViewProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  if (!isContactContentType(props.record.contentType)) {
    return (
      <SidePanelEmpty
        title={t('not-found-title', 'Nothing here')}
        description={t('not-found-description', 'This panel link does not point to a record.')}
        onBack={props.onBack}
        onClose={props.onClose}
      />
    );
  }

  return props.record.contentId === NEW_RECORD_ID ? (
    <SidePanelDraft {...props} />
  ) : (
    <SidePanelSavedRecord {...props} />
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
  const { open, record } = useSidePanel();
  const [width, setWidth] = useAtom(sidePanelWidthState);
  const [expanded] = useQueryState<boolean>('panelExpanded');
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Contacts expand into their own pages.
  const recordPage =
    record && record.contentId !== NEW_RECORD_ID && isContactContentType(record.contentType)
      ? getContactDetailPath(record.contentType, record.contentId, pathname)
      : null;

  return (
    <>
      {/* Links saved while records still expanded in place. */}
      {recordPage && expanded && <Navigate to={recordPage} replace />}
      {open && !(recordPage && expanded) && (
        <RecordSidePanel
          key="record"
          expanded={false}
          expandable={Boolean(recordPage)}
          onExpandedChange={() => {
            if (recordPage) void navigate(recordPage);
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
