import { IconTagsFilled } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

export const TagsBreadcrumb = ({ title }: { title: string }) => {
  return (
    <Button variant="ghost" className="font-semibold">
      <IconTagsFilled className="size-4 text-accent-foreground" />
      {title}
    </Button>
  );
};
