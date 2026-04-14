import { useState } from 'react';

import { IconBrandDatabricks } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { TemplateForm } from './TemplateForm';

export const TemplateSheet = ({
  children,
  contentType,
  contentId,
  onCompleted,
}: {
  children?: React.ReactNode;
  contentType: string;
  contentId: string;
  onCompleted?: (data: any) => void;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        {children || (
          <Button variant="secondary" className="text-primary">
            <IconBrandDatabricks /> Template
          </Button>
        )}
      </Sheet.Trigger>
      <Sheet.View className="w-[50%] md:w-[50%] lg:w-[50%]">
        <Sheet.Header>
          <Sheet.Title>Create Template</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <TemplateForm
          contentType={contentType}
          contentId={contentId}
          onCompleted={onCompleted}
          onClose={() => setOpen(false)}
        />
      </Sheet.View>
    </Sheet>
  );
};
