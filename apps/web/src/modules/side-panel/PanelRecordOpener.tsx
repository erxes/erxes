import { RecordOpenerProvider } from 'erxes-ui';
import type { PropsWithChildren } from 'react';
import { PanelOpenRecordContext } from './recordView';
import { getSidePanelRecordPath, NEW_RECORD_ID, type TRelationEntity } from './sidePanelPaths';
import { useSidePanel } from './useSidePanel';

/**
 * How erxes-ui's `useOpenRecord` and `ContactLink` open records and drafts, in core and plugin
 * UIs alike: in the side panel beside the page, or, from inside an open record (`stack`), on
 * top of it so Back returns there, on the `tab` the opener names. On a record's own page they
 * open on that page.
 */
export const PanelRecordOpener = ({
  stack = false,
  children,
}: PropsWithChildren<{ stack?: boolean }>) => {
  const { openRecord, openNewRecord, record, dismissPath } = useSidePanel();
  const options = stack ? { stack } : undefined;

  return (
    <RecordOpenerProvider
      open={({ tab, ...entity }) => openRecord(entity, { ...options, tab })}
      openNew={(contentType, defaults) => openNewRecord(contentType, defaults, options)}
      current={record?.contentId === NEW_RECORD_ID ? null : record}
      dismiss={(entity) => dismissPath(getSidePanelRecordPath(entity))}
    >
      <PanelOpenRecordContext value={(entity: TRelationEntity) => openRecord(entity)}>
        {children}
      </PanelOpenRecordContext>
    </RecordOpenerProvider>
  );
};
