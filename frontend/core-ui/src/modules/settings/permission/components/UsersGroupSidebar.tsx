import { UsersGroupModal } from '@/settings/permission/components/UsersGroupModal';
import {
  IconCopy,
  IconEdit,
  IconPlus,
  IconTrash,
  IconUserFilled,
} from '@tabler/icons-react';
import {
  Button,
  cn,
  ScrollArea,
  Sidebar,
  Skeleton,
  Spinner,
  TextOverflowTooltip,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { motion } from 'framer-motion';
import {
  IUserGroup,
  useRemoveUsersGroups,
  useUsersGroup,
  useUsersGroupsCopy,
} from 'ui-modules';

export const UsersGroupSidebar = () => {
  const { usersGroups, loading, error } = useUsersGroup();

  if (loading) {
    return (
      <Sidebar collapsible="none" className="flex-none border-r">
        <UsersGroupSidebarHeader />
        <Sidebar.Group>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <Skeleton className="w-full" />
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar>
    );
  }

  if (error) {
    return (
      <Sidebar collapsible="none" className="flex-none border-r">
        <UsersGroupSidebarHeader />
        <Sidebar.Group>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <div className="text-destructive">
                Error loading users groups: {error?.message as string}
              </div>
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar>
    );
  }
  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <UsersGroupSidebarHeader />
      <Sidebar.Group className="pr-0">
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <ScrollArea>
              <div className="max-w-(--sidebar-width) max-h-[calc(100dvh-4.75rem)] flex flex-col gap-3 pr-8">
                {usersGroups.map((group) => (
                  <UsersGroupSidebarItem
                    key={group._id}
                    group={group}
                    to={group._id ?? undefined}
                  />
                ))}
              </div>
              <ScrollArea.Bar />
            </ScrollArea>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

export const UsersGroupSidebarHeader = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-semibold text-accent-foreground">
                Users Groups
              </span>
              <UsersGroupModal.Create>
                <Button
                  variant="ghost"
                  className="text-xs font-semibold text-accent-foreground"
                >
                  <IconPlus />
                </Button>
              </UsersGroupModal.Create>
            </div>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};

export const UsersGroupSidebarItem = ({
  to,
  group,
}: {
  to: string;
  group: IUserGroup;
}) => {
  const [groupId, setGroupId] = useQueryState<string>('groupId');
  const isActive = groupId === to;
  return (
    <Sidebar.MenuItem className="w-full">
      <Sidebar.MenuButton
        isActive={isActive}
        className="h-full gap-3 flex-col items-start p-3 relative group"
        onClick={() => {
          setGroupId(to);
        }}
      >
        <span className="flex flex-col gap-2 w-full">
          <TextOverflowTooltip
            className={cn(
              isActive ? 'text-primary' : 'text-foreground',
              'text-base font-semibold',
            )}
            value={group.name}
          />
          <TextOverflowTooltip
            className={cn(
              isActive ? 'text-muted-foreground' : 'text-accent-foreground',
              'text-base font-normal',
            )}
            value={group.description || 'No description provided'}
          />
        </span>
        <span
          className={cn(
            isActive ? 'text-muted-foreground' : 'text-accent-foreground',
            'flex items-center gap-1 w-full font-normal',
          )}
        >
          <IconUserFilled size={16} />
          {group?.memberIds?.length || 0} members
        </span>
        <motion.div
          initial={{ x: 5, opacity: 0 }}
          whileHover={{ x: 0, opacity: 1 }}
          exit={{ x: 5, opacity: 0 }}
          transition={{ type: 'spring', ease: 'linear', duration: 0.5 }}
          className="size-full group-hover:bg-linear-to-r from-transparent to-accent absolute inset-0 hidden items-center justify-end gap-1 pr-3 group-hover:flex z-10"
        >
          <CopyButton group={group} />
          <UsersGroupModal.Edit groupId={group._id}>
            <Button
              variant={'outline'}
              onClick={(e) => e.stopPropagation()}
              className="size-7 flex items-center justify-center"
            >
              <IconEdit />
            </Button>
          </UsersGroupModal.Edit>
          <RemoveButton group={group} />
        </motion.div>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};

const RemoveButton = ({ group }: { group: IUserGroup }) => {
  const { removeUsersGroup, loading } = useRemoveUsersGroups();
  const { confirm } = useConfirm();
  return (
    <Button
      disabled={loading}
      variant={'outline'}
      onClick={(e) => {
        e.stopPropagation();
        confirm({
          message: `Are you sure you want to remove the group '${group.name}'`,
          options: { confirmationValue: 'delete' },
        }).then(() => removeUsersGroup(group._id));
      }}
      className="size-7 flex items-center justify-center"
    >
      {loading ? <Spinner /> : <IconTrash />}
    </Button>
  );
};

const CopyButton = ({ group }: { group: IUserGroup }) => {
  const { usersGroupsCopy, loading } = useUsersGroupsCopy();

  return (
    <Button
      disabled={loading}
      variant={'outline'}
      onClick={(e) => {
        e.stopPropagation();
        usersGroupsCopy(group._id);
      }}
      className="size-7 flex items-center justify-center"
    >
      {loading ? <Spinner /> : <IconCopy />}
    </Button>
  );
};
