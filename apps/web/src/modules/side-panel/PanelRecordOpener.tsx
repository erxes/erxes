import { RecordOpenerProvider } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useSidePanel } from './useSidePanel';

/**
 * How erxes-ui's `useOpenRecord` and `ContactLink` open records, in core and plugin UIs
 * alike: in the side panel beside the page, or, from inside an open record (`stack`), on top
 * of it so Back returns there. On a record's own page they open on that page.
 */
export const PanelRecordOpener = ({
  stack = false,
  children,
}: {
  stack?: boolean;
  children: ReactNode;
}) => {
  const { openRecord } = useSidePanel();

  return (
    <RecordOpenerProvider open={(record) => openRecord(record, stack ? { stack } : undefined)}>
      {children}
    </RecordOpenerProvider>
  );
};
