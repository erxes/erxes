import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';

export const TemplateImportSheet = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Sheet open={open} onOpenChange={() => setOpen(true)}>
      <Sheet.Trigger asChild>
        <Button>Import</Button>
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-7xl"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        Import Sheet
      </Sheet.View>
    </Sheet>
  );
};
