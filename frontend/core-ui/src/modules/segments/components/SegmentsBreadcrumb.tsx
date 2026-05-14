import { IconTagsFilled } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

export const SegmentsBreadcrumb = () => {
  return (
    <div className="flex gap-1 items-center">
      <Button variant="ghost" className="font-semibold">
        <IconTagsFilled className="size-4 text-accent-foreground" />
        Segments
      </Button>
    </div>
  );
};
