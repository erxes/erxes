import { createContext, type PropsWithChildren, use, useMemo } from 'react';
import { hostComponent } from '../../utils/host-component';

/** A record the host can open: `core:customer`, `core:company`, or a plugin's own type. */
export interface RecordRef {
  contentType: string;
  contentId: string;
}

type OpenRecord = (record: RecordRef) => void;

/** Opens a draft of a record type, starting with `defaults` (e.g. the stage it was added in). */
type OpenNewRecord = (contentType: string, defaults?: Record<string, unknown>) => void;

interface RecordOpener {
  open: OpenRecord;
  openNew: OpenNewRecord;
}

const RecordOpenerContext = createContext<RecordOpener | null>(null);

const ignore = () => undefined;

/**
 * How records open, provided by the host app (web): beside the page in its side panel, or,
 * inside a record, on top of that record so Back returns to it. erxes-ui is a Module
 * Federation singleton, so every plugin reads the host's.
 */
export const RecordOpenerProvider = ({
  open,
  openNew = ignore,
  children,
}: PropsWithChildren<{ open: OpenRecord; openNew?: OpenNewRecord }>) => {
  const opener = useMemo(() => ({ open, openNew }), [open, openNew]);

  return <RecordOpenerContext value={opener}>{children}</RecordOpenerContext>;
};

/**
 * `const { open, openNew } = useOpenRecord()`: `open({ contentType: 'sales:deal', contentId })`
 * opens a record in core's side panel, the page staying under it, and
 * `openNew('sales:deal', { stageId })` opens a draft that becomes the record on Save. Any
 * type core or an installed plugin registers opens (`IUIConfig.recordTypes`). `canOpen` is
 * false outside erxes (a plugin page rendered on its own), where both do nothing.
 */
export const useOpenRecord = () => {
  const opener = use(RecordOpenerContext);

  return {
    open: opener?.open ?? ignore,
    openNew: opener?.openNew ?? ignore,
    canOpen: opener !== null,
  };
};

const page = hostComponent<RecordRef>();

/** Web registers how a record draws on its own page. */
export const setRecordPage = page.set;

/**
 * A record on its own page, as core draws it for `core:customer`: the record's View at full
 * size, under the page header, with Back to its list. A plugin routes its record type's
 * `listPath/:id` to `<RecordPage contentType="sales:deal" contentId={id} />`.
 */
export const RecordPage = page.Host;
