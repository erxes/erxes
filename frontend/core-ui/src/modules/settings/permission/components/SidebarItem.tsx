import { IconLoader, IconUserFilled } from '@tabler/icons-react';
import { Sidebar } from 'erxes-ui';
import { IUsersGroup } from '@/settings/permission/types';

export function PermissionSidebarItem({
  data: { name, description, members },
}: {
  data: IUsersGroup;
}) {
  return (
    <Sidebar.MenuItem className="flex flex-col gap-3 p-3 rounded-[8px] hover:bg-black/5 cursor-pointer">
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-base">{name!}</label>
        <div className="text-accent-foreground truncate">{description!}</div>
      </div>
      <div className="flex gap-1 text-accent-foreground">
        {(members.length > 0 && <IconUserFilled size={16} />) || (
          <IconLoader size={16} />
        )}
        {(members?.length > 0 && <span>{members?.length} members</span>) || (
          <span>No members</span>
        )}
      </div>
    </Sidebar.MenuItem>
  );
}
