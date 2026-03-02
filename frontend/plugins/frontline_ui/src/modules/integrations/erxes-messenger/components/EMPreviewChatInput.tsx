import { IconSend } from '@tabler/icons-react';
import { Button, Input } from 'erxes-ui';

export const EMPreviewChatInput = () => {
  return (
    <div className="flex items-center gap-2 p-4">
      <Input placeholder={'Send message'} className="flex-1 shadow-2xs" />
      <Button size={'icon'} className="shrink-0 size-8 bg-primary">
        <IconSend />
      </Button>
    </div>
  );
};
