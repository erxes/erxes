import { IconUsersGroup } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

export function TeamMemberSettingsBreadcrumb() {
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconUsersGroup className="w-4 h-4 text-accent-foreground" />
        Team member
      </Button>
    </>
  );
}
