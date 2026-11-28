import {
  createContext,
  type PropsWithChildren,
  use,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { hostComponent } from '../../utils/host-component';

/**
 * A record the host can open, by `contentType` and `contentId`.
 * The type is `core:customer`, `core:company`, or a plugin's own.
 */
export interface RecordRef {
  contentType: string;
  contentId: string;
}

/**
 * Opens a record; `tab` picks the tab it opens on: `detail`, `activity` or one of its type's
 * `tabs` by `value`. A tab the record lacks opens its default.
 */
type OpenRecord = (record: RecordRef & { tab?: string }) => void;

/** Opens a draft of a record type, starting with `defaults` (e.g. the stage it was added in). */
type OpenNewRecord = (contentType: string, defaults?: Record<string, unknown>) => void;

type DismissRecord = (record: RecordRef) => void;

interface RecordOpener {
  open: OpenRecord;
  openNew: OpenNewRecord;
  dismiss: DismissRecord;
}

const RecordOpenerContext = createContext<RecordOpener | null>(null);

const CurrentRecordContext = createContext<RecordRef | null>(null);

const ignore = () => undefined;

/**
 * The host app's way to open records, which `useOpenRecord` calls.
 * Web provides it: beside the page in its side panel, or, inside a record, on top of that
 * record so Back returns to it. erxes-ui is a Module Federation singleton, so every plugin
 * reads the host's. The functions `useOpenRecord` gives keep their identity while the host's
 * change, so a list's rows don't re-render when the panel shows another record.
 */
export const RecordOpenerProvider = ({
  open,
  openNew = ignore,
  current = null,
  dismiss = ignore,
  children,
}: PropsWithChildren<{
  open: OpenRecord;
  openNew?: OpenNewRecord;
  current?: RecordRef | null;
  dismiss?: DismissRecord;
}>) => {
  const latest = useRef({ open, openNew, dismiss });

  useLayoutEffect(() => {
    latest.current = { open, openNew, dismiss };
  });

  const opener = useMemo<RecordOpener>(
    () => ({
      open: (record) => latest.current.open(record),
      openNew: (contentType, defaults) => latest.current.openNew(contentType, defaults),
      dismiss: (record) => latest.current.dismiss(record),
    }),
    [],
  );

  return (
    <RecordOpenerContext value={opener}>
      <CurrentRecordContext value={current}>{children}</CurrentRecordContext>
    </RecordOpenerContext>
  );
};

/**
 * Opens a record, or a new draft, in core's side panel.
 * `const { open, openNew } = useOpenRecord()`: `open({ contentType: 'sales:deal', contentId })`
 * opens a record in core's side panel, the page staying under it, on its default tab, or on
 * the one `tab` names (`open({ contentType: 'hr:employee', contentId, tab: 'leave' })`), and
 * `openNew('sales:deal', { stageId })` opens a draft that becomes the record on Save. Any
 * type core or an installed plugin registers opens (`IUIConfig.recordTypes`). `canOpen` is
 * false outside erxes (a plugin page rendered on its own), where both do nothing.
 *
 * `dismiss(record)` takes a record out of the panel, shown or behind Back, e.g. one the list
 * just deleted. The functions keep their identity, so a row that calls this re-renders only for
 * its own data. The record shown now is `useCurrentRecord`; inside a record, `useRecordPanel`.
 */
export const useOpenRecord = () => {
  const opener = use(RecordOpenerContext);

  return {
    open: opener?.open ?? ignore,
    openNew: opener?.openNew ?? ignore,
    dismiss: opener?.dismiss ?? ignore,
    canOpen: opener !== null,
  };
};

/**
 * The record core's panel shows now: null when it shows none or a draft. For a list that marks
 * it or steps to the next (j/k); the component that calls it re-renders each time the panel
 * shows another record, so call it once per list, not per row.
 */
export const useCurrentRecord = () => use(CurrentRecordContext);

/**
 * What a record shown in core's panel, or on its own page, can do to it. Core's own tabs are
 * `detail` and `activity`; a type's `tabs` use their `value`.
 */
export interface RecordPanelControls {
  record: RecordRef;
  /** The tab shown; empty is the record's default. */
  tab: string;
  /** Shows a tab: an Actions menu item whose form opens on Detail picks `detail` first. */
  setTab: (tab: string) => void;
  /** Closes the panel; on a record's own page, goes back to its list. */
  close: () => void;
  /** Takes this record out, e.g. after deleting it: back to the record under it, else closed. */
  dismiss: () => void;
  /** Puts another record in this one's place, Back unchanged: a request accepted as a task. */
  replace: (next: RecordRef) => void;
}

const RecordPanelContext = createContext<RecordPanelControls | null>(null);

/** Web gives each record it shows its controls. */
export const RecordPanelProvider = RecordPanelContext;

/**
 * The record a slot is in, and what the slot can do to it.
 * Any slot (`Title`, `Actions`, `Detail`, a tab, a relation tab): `const panel = useRecordPanel()`, then `panel?.dismiss()` after a delete,
 * `panel?.replace({ contentType: 'tasks:task', contentId })`, `panel?.setTab('detail')`.
 * Null outside a record (a plugin page on its own).
 */
export const useRecordPanel = () => use(RecordPanelContext);

/** A `RecordPage`'s record, and the list it goes back to. */
export interface RecordPageProps extends RecordRef {
  /**
   * The list closing or deleting the record goes back to, e.g. its team's tasks; without it, the
   * plugin's first page. Pass it once the record is known.
   */
  listPath?: string;
}

const page = hostComponent<RecordPageProps>();

/** Web registers how a record draws on its own page. */
export const setRecordPage = page.set;

/**
 * A record on its own page, as core draws a customer's.
 * The record's View at full size, under the page header, with Back to its list. A plugin
 * routes its record type's `detailPath` to `<RecordPage contentType="sales:deal" contentId={id} listPath="/sales/deals" />`.
 */
export const RecordPage = page.Host;
