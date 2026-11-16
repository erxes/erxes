import { RecordOpenerProvider } from 'erxes-ui';
import type { PropsWithChildren } from 'react';
import { useSidePanel } from './useSidePanel';

/**
 * How erxes-ui's `useOpenRecord` and `ContactLink` open records and drafts, in core and plugin
 * UIs alike: in the side panel beside the page, or, from inside an open record (`stack`), on
 * top of it so Back returns there. On a record's own page they open on that page.
 */
export const PanelRecordOpener = ({
  stack = false,
  children,
}: PropsWithChildren<{ stack?: boolean }>) => {
  const { openRecord, openNewRecord } = useSidePanel();
  const options = stack ? { stack } : undefined;

  return (
    <RecordOpenerProvider
      open={(record) => openRecord(record, options)}
      openNew={(contentType, defaults) => openNewRecord(contentType, defaults, options)}
    >
      {children}
    </RecordOpenerProvider>
  );
};
