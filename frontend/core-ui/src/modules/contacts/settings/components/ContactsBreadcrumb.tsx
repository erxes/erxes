import { IconBookmarksFilled } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';

export const ContactsBreadcrumb = () => {
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconBookmarksFilled className="w-4 h-4 text-accent-foreground" />
        Contacts
      </Button>
      <Separator.Inline />
    </>
  );
};
