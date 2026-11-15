import { createContext, type PropsWithChildren, use } from 'react';

/** A record the host can open: `core:customer`, `core:company`, or a plugin's own type. */
export interface RecordRef {
  contentType: string;
  contentId: string;
}

type OpenRecord = (record: RecordRef) => void;

const RecordOpenerContext = createContext<OpenRecord | null>(null);

/**
 * How records open, provided by the host app (web): beside the page in its side panel, or,
 * inside a record, on top of that record so Back returns to it. erxes-ui is a Module
 * Federation singleton, so every plugin reads the host's.
 */
export const RecordOpenerProvider = ({
  open,
  children,
}: PropsWithChildren<{ open: OpenRecord }>) => (
  <RecordOpenerContext value={open}>{children}</RecordOpenerContext>
);

const ignore: OpenRecord = () => undefined;

/**
 * `const { open } = useOpenRecord(); open({ contentType: 'core:customer', contentId })` opens
 * the record in core's side panel, the plugin page staying under it. `canOpen` is false
 * outside erxes (a plugin page rendered on its own), where `open` does nothing.
 */
export const useOpenRecord = () => {
  const open = use(RecordOpenerContext);

  return { open: open ?? ignore, canOpen: open !== null };
};
