import { DocumentPrintDialog } from '@/documents/components/DocumentPrintDialog';
import { IconPrinter } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useState } from 'react';

export function BroadcastPrintDocument() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="text-primary"
        onClick={() => setOpen(true)}
      >
        <IconPrinter />
        Print
      </Button>
      <DocumentPrintDialog
        documentItem={{ contentType: 'core:broadcast' }}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
