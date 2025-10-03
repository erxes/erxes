import React, { useState } from 'react';
import { useGetCurrentUsersTeams } from '@/team/hooks/useGetCurrentUsersTeams';
import {
  Button,
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import {
  useUsers,
  SelectMember,
  currentUserState,
  IUser,
  useSelectMemberContext,
  MembersInline,
} from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useGetTeamMembers } from '@/team/hooks/useGetTeamMembers';
import { useDebounce } from 'use-debounce';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import { IconUser } from '@tabler/icons-react';

export const SelectLeadProvider = SelectMember.Provider;

const SelectLeadValue = ({ placeholder }: { placeholder?: string }) => {
  return <SelectMember.Value placeholder={placeholder} />;
};

export const SelectTeamMemberContent = ({
  teamIds,
  exclude,
}: {
  teamIds?: string[] | string;
  exclude: boolean;
}) => {
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
      excludeIds: exclude,
      ids: filteredIds,
    },
    skip: !excludeIds || !filteredIds?.length,
  });
  const membersList = exclude
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
        {members.map((member) => (
          <SelectMember.CommandItem key={member._id} user={member} />
        ))}
        {members.length > 0 &&
          members.some((member) => !memberIds?.includes(member._id)) && (
            <Command.Separator className="my-1" />
          )}
        {!loading &&
          membersList.map((user) => (
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

const SelectLeadContent = ({ teamIds }: { teamIds?: string[] | string }) => {
  return <SelectTeamMemberContent teamIds={teamIds} exclude={false} />;
};

export const SelectLeadFilterItem = () => {
  return (
    <Filter.Item value="lead">
      <IconUser />
      Lead
    </Filter.Item>
  );
};

export const SelectLeadFilterView = ({
  onValueChange,
  queryKey,
}: {
  onValueChange?: (value: string) => void;
  queryKey?: string;
}) => {
  const [lead, setLead] = useQueryState<string>(queryKey || 'lead');
  const { resetFilterState } = useFilterContext();
  const { teams } = useGetCurrentUsersTeams();

  return (
    <Filter.View filterKey={queryKey || 'lead'}>
      <SelectLeadProvider
        mode="single"
        value={lead || ''}
        onValueChange={(value) => {
          setLead(value as string);
          resetFilterState();
          onValueChange?.(value as string);
        }}
      >
        <SelectLeadContent teamIds={teams?.map((team) => team._id)} />
      </SelectLeadProvider>
    </Filter.View>
  );
};

export const SelectLeadFilterBar = ({
  iconOnly,
  onValueChange,
  queryKey,
  teamIds,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string) => void;
  queryKey?: string;
  teamIds?: string[] | string;
}) => {
  const [lead, setLead] = useQueryState<string>(queryKey || 'lead');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey || 'lead'}>
      <Filter.BarName>
        <IconUser />
        {!iconOnly && 'Lead'}
      </Filter.BarName>
      <SelectLeadProvider
        mode="single"
        value={lead || ''}
        onValueChange={(value) => {
          if (value) {
            setLead(value as string);
          } else {
            setLead(null);
          }
          setOpen(false);
          onValueChange?.(value as string);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'lead'}>
              <SelectLeadValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectLeadContent teamIds={teamIds} />
          </Combobox.Content>
        </Popover>
      </SelectLeadProvider>
    </Filter.BarItem>
  );
};

export const SelectLeadInlineCell = ({
  teamIds,
  value,
  id,
  onValueChange,
  scope,
  ...props
}: {
  teamIds?: string[] | string;
  value?: string;
  id?: string;
  onValueChange?: (value: string | string[]) => void;
  scope?: string;
} & Omit<
  React.ComponentProps<typeof SelectLeadProvider>,
  'children' | 'onValueChange' | 'value'
>) => {
  const { updateProject } = useUpdateProject();
  const [open, setOpen] = useState(false);

  const handleValueChange = (value: string | string[] | null) => {
    if (id) {
      updateProject({
        variables: {
          _id: id,
          leadId: value,
        },
      });
    }
    value && onValueChange?.(value);
    setOpen(false);
  };

  return (
    <SelectLeadProvider
      mode="single"
      value={value || ''}
      onValueChange={handleValueChange}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectLeadValue placeholder="Lead not specified" />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectLeadContent teamIds={teamIds} />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectLeadProvider>
  );
};

const SelectLeadFormValue = () => {
  const { members, memberIds, setMembers } = useSelectMemberContext();
  return (
    <MembersInline
      memberIds={memberIds}
      members={members}
      updateMembers={setMembers}
      className="font-medium text-base text-foreground"
      placeholder="Select lead"
    />
  );
};

export const SelectLeadFormItem = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectLeadProvider>, 'children'> & {
    className?: string;
    teamIds?: string[] | string;
  }
>(({ onValueChange, className, teamIds, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectLeadProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.TriggerBase
            ref={ref}
            className={cn('w-full h-7', className)}
          >
            <SelectLeadFormValue />
          </Combobox.TriggerBase>
        </Form.Control>
        <Combobox.Content>
          <SelectLeadContent teamIds={teamIds} />
        </Combobox.Content>
      </Popover>
    </SelectLeadProvider>
  );
});

SelectLeadFormItem.displayName = 'SelectLeadFormItem';

const SelectLeadRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectLeadProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
      teamIds?: string[] | string;
    }
>(
  (
    { onValueChange, className, mode, value, placeholder, teamIds, ...props },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    return (
      <SelectLeadProvider
        onValueChange={(value) => {
          onValueChange?.(value);
          setOpen(false);
        }}
        mode={mode}
        value={value}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Combobox.Trigger
            ref={ref}
            className={cn('w-full inline-flex', className)}
            variant="outline"
            {...props}
          >
            <SelectLeadValue placeholder={placeholder} />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectLeadContent teamIds={teamIds} />
          </Combobox.Content>
        </Popover>
      </SelectLeadProvider>
    );
  },
);

SelectLeadRoot.displayName = 'SelectLeadRoot';

export const SelectLeadDetail = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectLeadProvider>, 'children'> & {
    className?: string;
    teamIds?: string[] | string;
    id?: string;
  }
>(({ onValueChange, className, teamIds, id, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  const { updateProject } = useUpdateProject();
  const handleValueChange = (value: string | string[] | null) => {
    if (id) {
      updateProject({
        variables: {
          _id: id,
          leadId: value,
        },
      });
    }
    value && onValueChange?.(value);
    setOpen(false);
  };
  return (
    <SelectLeadProvider onValueChange={handleValueChange} {...props}>
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.TriggerBase
          ref={ref}
          className={cn('w-min shadow-xs', className)}
          asChild
        >
          <Button variant="secondary" className="h-7">
            <SelectLeadFormValue />
          </Button>
        </Combobox.TriggerBase>
        <Combobox.Content>
          <SelectLeadContent teamIds={teamIds} />
        </Combobox.Content>
      </Popover>
    </SelectLeadProvider>
  );
});

SelectLeadDetail.displayName = 'SelectLeadDetail';

export const SelectLead = Object.assign(SelectLeadRoot, {
  Provider: SelectLeadProvider,
  Value: SelectLeadValue,
  Content: SelectLeadContent,
  FilterItem: SelectLeadFilterItem,
  FilterView: SelectLeadFilterView,
  FilterBar: SelectLeadFilterBar,
  InlineCell: SelectLeadInlineCell,
  FormItem: SelectLeadFormItem,
  Detail: SelectLeadDetail,
});
