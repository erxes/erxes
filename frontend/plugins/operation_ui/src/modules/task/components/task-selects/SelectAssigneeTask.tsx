import { forwardRef, useEffect, useState } from 'react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  useFilterContext,
  useQueryState,
  HoverCard,
  Avatar,
  readImage,
  IconComponent,
  Button,
} from 'erxes-ui';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IconChevronRight,
  IconUsers,
  IconClipboard,
} from '@tabler/icons-react';
import {
  useUsers,
  SelectMember,
  currentUserState,
  IUser,
  useSelectMemberContext,
  MembersInline,
  useAssignedMember,
} from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useGetTeamMembers } from '@/team/hooks/useGetTeamMembers';
import { useGetTeams } from '@/team/hooks/useGetTeams';
import { useDebounce } from 'use-debounce';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import {
  SelectOperationContent,
  SelectTriggerOperation,
  SelectTriggerVariant,
} from '@/operation/components/SelectOperation';
import { useProjects } from '@/project/hooks/useGetProjects';

const SelectAssigneeProvider = SelectMember.Provider;

interface ExpandableSectionProps<T> {
  title: string;
  icon: React.ElementType;
  items?: T[];
  loading: boolean;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyText: string;
}

const ExpandableSection = <T,>({
  title,
  icon: Icon,
  items,
  loading,
  renderItem,
  keyExtractor,
  emptyText,
}: ExpandableSectionProps<T>) => {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 2;

  if (loading) {
    return (
      <div className="flex flex-col gap-2 pt-2 border-t">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Icon className="size-3.5" />
          <span>{title}</span>
        </div>
        <div className="text-xs text-muted-foreground pl-5">Loading...</div>
      </div>
    );
  }

  const hasItems = items && items.length > 0;
  const displayedItems = expanded ? items : items?.slice(0, LIMIT);
  const remainingCount = (items?.length || 0) - LIMIT;

  return (
    <div className="flex flex-col gap-2 ">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        <span>
          {title} {hasItems && `(${items?.length})`}
        </span>
      </div>

      <div className="flex gap-2.5 items-center flex-wrap">
        {hasItems ? (
          <>
            {displayedItems?.map((item) => (
              <div key={keyExtractor(item)} className="min-w-0 max-w-full">
                {renderItem(item)}
              </div>
            ))}

            {remainingCount > 0 && (
              <Button
                variant="link"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                {expanded ? 'Show less' : `+${remainingCount} more`}
              </Button>
            )}
          </>
        ) : (
          <div className="text-xs text-muted-foreground pl-5">{emptyText}</div>
        )}
      </div>
    </div>
  );
};

const AssigneeHoverCard = forwardRef(
  (
    {
      assigneeId,
      children,
      ...props
    }: {
      assigneeId: string;
      children: React.ReactNode;
    },
    ref,
  ) => {
    const { details: assigneeDetails, loading: userLoading } =
      useAssignedMember({
        variables: { _id: assigneeId },
        skip: !assigneeId,
      });

    const { teams, loading: teamsLoading } = useGetTeams({
      variables: { userId: assigneeId },
      skip: !assigneeId,
    });

    const { projects, loading: projectsLoading } = useProjects({
      variables: {
        userId: assigneeId,
      },
      skip: !assigneeId,
    });

    if (!assigneeId || userLoading || !assigneeDetails) {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          {...props}
          style={{ display: 'inline-block' }}
        >
          {children}
        </div>
      );
    }

    const { fullName, avatar } = assigneeDetails;

    return (
      <HoverCard openDelay={300}>
        <HoverCard.Trigger asChild>
          <div
            ref={ref as React.Ref<HTMLDivElement>}
            {...props}
            style={{ display: 'inline-block' }}
          >
            {children}
          </div>
        </HoverCard.Trigger>
        <HoverCard.Content className="w-60 p-3" side="right" align="start">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-center pb-2 border-b">
              <Avatar size="xl">
                <Avatar.Image src={readImage(avatar as string, 200)} />
                <Avatar.Fallback>{fullName?.charAt(0) || ''}</Avatar.Fallback>
              </Avatar>
              <div className="font-semibold text-sm truncate">
                {fullName || 'Unnamed user'}
              </div>
            </div>
            <ExpandableSection
              title="Teams"
              icon={IconUsers}
              loading={teamsLoading}
              items={teams}
              emptyText="No teams assigned"
              keyExtractor={(team) => team._id}
              renderItem={(team) => (
                <div key={team._id} className="text-xs flex items-center gap-1">
                  {team.icon && (
                    <IconComponent
                      name={team.icon}
                      className="size-4 shrink-0"
                    />
                  )}
                  <span className="truncate">{team.name}</span>
                </div>
              )}
            />
            <ExpandableSection
              title="Projects"
              icon={IconClipboard}
              loading={projectsLoading}
              items={projects}
              emptyText="No projects assigned"
              keyExtractor={(project) => project._id}
              renderItem={(project) => (
                <div
                  key={project._id}
                  className="text-xs flex items-center gap-1"
                >
                  {project.icon && (
                    <IconComponent
                      name={project.icon as string}
                      className="size-4 shrink-0"
                    />
                  )}
                  <span className="truncate">{project.name}</span>
                </div>
              )}
            />
          </div>
        </HoverCard.Content>
      </HoverCard>
    );
  },
);

const SelectAssigneeValue = ({
  placeholder,
  variant,
}: {
  placeholder?: string;
  variant?: `${SelectTriggerVariant}`;
}) => {
  const { memberIds, members, setMembers } = useSelectMemberContext();
  if (variant === SelectTriggerVariant.CARD) {
    return (
      <MembersInline.Provider
        memberIds={memberIds}
        members={members}
        allowUnassigned
        updateMembers={setMembers}
      >
        <MembersInline.Avatar />
      </MembersInline.Provider>
    );
  }
  return <SelectMember.Value placeholder={placeholder || 'Select assignee'} />;
};

const SelectTeamMemberContent = ({
  teamIds,
  exclude,
}: {
  teamIds?: string[] | string;
  exclude: boolean;
}) => {
  const hasTeamIds = Array.isArray(teamIds) ? teamIds.length > 0 : !!teamIds;
  const { members: teamMembers } = useGetTeamMembers({ teamIds });
  const excludeIds = teamMembers?.map((member) => member.memberId);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const currentUser = useAtomValue(currentUserState) as IUser;
  const { memberIds, members } = useSelectMemberContext();
  const filteredIds = excludeIds?.filter((id) => id !== currentUser._id);
  const { users, loading, handleFetchMore, totalCount, error } = useUsers({
    variables: {
      searchValue: debouncedSearch,
      ...(hasTeamIds ? { excludeIds: exclude, ids: filteredIds } : {}),
    },
    skip: hasTeamIds ? !excludeIds || !filteredIds?.length : false,
  });
  const membersList =
    exclude && hasTeamIds
      ? [currentUser, ...users].filter(
          (user) =>
            !memberIds?.find((memberId) => memberId === user._id) &&
            !excludeIds?.find((excludeId) => excludeId === user._id),
        )
      : [currentUser, ...users].filter(
          (user) => !members.find((member) => member._id === user._id),
        );

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        focusOnMount
      />
      <Command.List className="max-h-[300px] overflow-y-auto">
        <Combobox.Empty loading={loading} error={error} />
        {members.length > 0 && (
          <>
            {members.map((member) => (
              <SelectMember.CommandItem key={member._id} user={member} />
            ))}
            {!loading && membersList.length > 0 && (
              <Command.Separator className="my-1" />
            )}
          </>
        )}

        {!loading && <SelectMember.NoAssigneeItem />}
        {!loading &&
          membersList.map((user: IUser) => (
            <SelectMember.CommandItem key={user._id} user={user} />
          ))}
        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          currentLength={users.length}
          totalCount={totalCount}
        />
      </Command.List>
    </Command>
  );
};

const SelectAssigneeFilterView = ({
  teamIds,
}: {
  teamIds?: string[] | string;
}) => {
  const [assignee, setAssignee] = useQueryState<string>('assignee');
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey="assignee">
      <SelectAssigneeProvider
        mode="single"
        value={
          assignee === 'no-assignee' ? 'no-assignee' : (assignee ?? undefined)
        }
        onValueChange={(value) => {
          setAssignee(value === null ? 'no-assignee' : (value as string));
          resetFilterState();
        }}
      >
        <SelectTeamMemberContent exclude={false} teamIds={teamIds} />
      </SelectAssigneeProvider>
    </Filter.View>
  );
};

export const SelectAssigneeFilterBar = ({
  teamIds,
}: {
  teamIds?: string[] | string;
}) => {
  const [assignee, setAssignee] = useQueryState<string>('assignee');
  const [open, setOpen] = useState(false);
  return (
    <SelectAssigneeProvider
      mode="single"
      value={assignee || ''}
      onValueChange={(value) => {
        if (value) {
          setAssignee(value as string);
        } else {
          setAssignee(null);
        }
        setOpen(false);
      }}
      allowUnassigned={true}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={'assignee'}>
            <SelectAssigneeValue />
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <SelectTeamMemberContent teamIds={teamIds} exclude={false} />
        </Combobox.Content>
      </Popover>
    </SelectAssigneeProvider>
  );
};

const SelectAssigneeTaskRoot = ({
  scope,
  value,
  variant,
  id,
  teamIds,
}: {
  value: string;
  scope?: string;
  variant: `${SelectTriggerVariant}`;
  teamIds?: string[] | string;
  id?: string;
}) => {
  const { updateTask } = useUpdateTask();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleValueChange = (newValue: string | string[] | null) => {
    setInternalValue((newValue as string) ?? undefined);
    if (id) {
      updateTask({
        variables: {
          _id: id,
          assigneeId: newValue,
        },
      });
    }
    setOpen(false);
  };

  const handleViewTasks = (e: React.MouseEvent) => {
    e.stopPropagation();
    const basePath = teamId
      ? `/operation/team/${teamId}/tasks`
      : '/operation/tasks';
    navigate(`${basePath}?assignee=${internalValue}`);
  };

  const trigger =
    variant === 'detail' && internalValue ? (
      <AssigneeHoverCard assigneeId={internalValue}>
        <SelectTriggerOperation variant={variant}>
          <SelectAssigneeValue variant={variant} />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 ml-1"
            onClick={handleViewTasks}
            title="View assigned tasks"
          >
            <IconChevronRight className="size-4" />
          </Button>
        </SelectTriggerOperation>
      </AssigneeHoverCard>
    ) : (
      <SelectTriggerOperation variant={variant === 'card' ? 'icon' : variant}>
        <SelectAssigneeValue variant={variant} />
      </SelectTriggerOperation>
    );

  return (
    <SelectAssigneeProvider
      value={internalValue}
      onValueChange={handleValueChange}
      mode="single"
      allowUnassigned
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        {trigger}
        <SelectOperationContent variant={variant}>
          <SelectTeamMemberContent teamIds={teamIds} exclude={false} />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectAssigneeProvider>
  );
};

export const SelectAssigneeTaskFormItem = ({
  value,
  onValueChange,
  scope,
  teamIds,
}: {
  value: string;
  onValueChange: (value: string) => void;
  scope?: string;
  teamIds?: string[] | string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectAssigneeProvider
      value={value}
      onValueChange={(value) => {
        onValueChange(value as string);
        setOpen(false);
      }}
      mode="single"
      allowUnassigned
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTriggerOperation variant="form">
          <SelectAssigneeValue />
        </SelectTriggerOperation>
        <Combobox.Content>
          <SelectTeamMemberContent teamIds={teamIds} exclude={false} />
        </Combobox.Content>
      </PopoverScoped>
    </SelectAssigneeProvider>
  );
};

export const SelectAssigneeTask = Object.assign(SelectAssigneeTaskRoot, {
  Provider: SelectAssigneeProvider,
  Content: SelectTeamMemberContent,
  FormItem: SelectAssigneeTaskFormItem,
  FilterView: SelectAssigneeFilterView,
  FilterBar: SelectAssigneeFilterBar,
});
