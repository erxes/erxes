import { useLocation } from 'react-router';
import { Button, Separator } from 'erxes-ui';
import { IconMailFilled } from '@tabler/icons-react';

export const InboxSettingsBreadcrumb = () => {
  return (
    <>
      <Button variant={'ghost'} className="font-semibold">
        <IconMailFilled className="w-4 h-4 text-accent-foreground" />
        Team inbox
      </Button>
      <Separator.Inline />
    </>
  );
};
