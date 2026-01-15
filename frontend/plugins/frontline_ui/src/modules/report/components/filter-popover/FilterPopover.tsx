import React, { useState, useMemo, createContext, useContext } from 'react';
import { Button, Combobox, Command, Tooltip, Popover } from 'erxes-ui';
import {
  IconFilter2,
  IconCheck,
  IconChevronRight,
  IconChevronLeft,
} from '@tabler/icons-react';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { IChannel } from '@/inbox/types/Channel';
import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import { currentUserState, IUser, useUsers } from 'ui-modules';
import { useAtomValue, atom, useAtom } from 'jotai';
import { useDebounce } from 'use-debounce';
import { cn } from 'erxes-ui/lib';
import { Except } from 'type-fest';

const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-week', label: 'This Week' },
  { value: 'last-week', label: 'Last Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'this-year', label: 'This Year' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Date' },
] as const;

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All Sources' },
  { value: 'facebook-messenger', label: 'Facebook Messenger' },
  { value: 'facebook-post', label: 'Facebook Post' },
  { value: 'instagram-messenger', label: 'Instagram Messenger' },
  { value: 'instagram-post', label: 'Instagram Post' },
  { value: 'call', label: 'Call' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'form', label: 'Form' },
];

const filterViewState = atom<Record<string, string>>({});

const getFilterViewState = (id: string) => {
  return atom(
    (get) => get(filterViewState)[id] || 'root',
    (get, set, newValue: string) => {
      set(filterViewState, {
        ...get(filterViewState),
        [id]: newValue,
      });
    },
  );
};

interface FilterPopoverContextValue {
  id: string;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  dateValue: string;
  onDateValueChange: (value: string) => void;
  channelFilter: string[];
  onChannelFilterChange: (value: string[]) => void;
  memberFilter: string[];
  onMemberFilterChange: (value: string[]) => void;
}

const FilterPopoverContext = createContext<FilterPopoverContextValue | null>(
  null,
);

const useFilterPopoverContext = () => {
  const context = useContext(FilterPopoverContext);
  if (!context) {
    throw new Error(
      'useFilterPopoverContext must be used within FilterPopoverProvider',
    );
  }
  return context;
};

interface FilterPopoverProviderProps {
  children: React.ReactNode;
  id: string;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  dateValue: string;
  onDateValueChange: (value: string) => void;
  channelFilter: string[];
  onChannelFilterChange: (value: string[]) => void;
  memberFilter: string[];
  onMemberFilterChange: (value: string[]) => void;
}

const FilterPopoverProvider = ({
  children,
  id,
  ...props
}: FilterPopoverProviderProps) => {
  return (
    <FilterPopoverContext.Provider value={{ id, ...props }}>
      {children}
    </FilterPopoverContext.Provider>
  );
};

const FilterPopoverTrigger = ({
  isFiltered,
  ...props
}: React.ComponentPropsWithoutRef<typeof Button> & {
  isFiltered?: boolean;
}) => {
  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={0}>
        <Tooltip.Trigger asChild>
          <Button
            variant="ghost"
            size={isFiltered ? 'icon' : 'default'}
            {...props}
          >
            <IconFilter2 className="w-4 h-4" />
            {!isFiltered && 'Filters'}
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Filters</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

const FilterPopoverItem = React.forwardRef<
  React.ComponentRef<typeof Command.Item>,
  Except<React.ComponentPropsWithoutRef<typeof Command.Item>, 'value'> & {
    value: string;
    active?: boolean;
  }
>(({ children, value, className, active, ...props }, ref) => {
  const { id } = useFilterPopoverContext();
  const [view, setView] = useAtom(getFilterViewState(id));

  const onSelect = () => {
    setView(value);
  };

  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      ref={ref}
      className={cn('h-8', active && 'text-primary', className)}
      {...props}
    >
      {children}
      <IconChevronRight className="w-4 h-4 ml-auto" />
    </Command.Item>
  );
});

const FilterPopoverCommandItem = React.forwardRef<
  React.ComponentRef<typeof Command.Item>,
  React.ComponentPropsWithoutRef<typeof Command.Item>
>(({ className, onSelect, ...props }, ref) => {
  const { id } = useFilterPopoverContext();
  const [view, setView] = useAtom(getFilterViewState(id));

  const handleSelect = (value: string) => {
    onSelect?.(value);
    setView('root');
  };

  return (
    <Command.Item
      ref={ref}
      className={cn('h-8', className)}
      onSelect={(value) => handleSelect(value)}
      {...props}
    />
  );
});

const FilterPopoverView = ({
  children,
  filterKey = 'root',
}: {
  children: React.ReactNode;
  filterKey?: string;
}) => {
  const { id } = useFilterPopoverContext();
  const view = useAtomValue(getFilterViewState(id));

  if (view !== filterKey) {
    return null;
  }
  return <>{children}</>;
};

const RootView = () => {
  const {
    sourceFilter,
    channelFilter,
    dateValue,
    memberFilter,
  } = useFilterPopoverContext();
  const { channels } = useGetChannels();

  const getSourceLabel = () => {
    const option = SOURCE_OPTIONS.find((opt) => opt.value === sourceFilter);
    return option?.label || 'All Sources';
  };

  const getChannelLabel = () => {
    if (!channelFilter || channelFilter.length === 0) return 'All Channels';
    if (channelFilter.length === 1) {
      const channel = channels?.find(
        (c: IChannel) => c._id === channelFilter[0],
      );
      return channel?.name || 'All Channels';
    }
    return `${channelFilter.length} Channels`;
  };

  const getDateLabel = () => {
    const option = DATE_OPTIONS.find((opt) => opt.value === dateValue);
    return option?.label || 'Select date';
  };

  const getMemberLabel = () => {
    if (!memberFilter || memberFilter.length === 0) return 'All Members';
    return `${memberFilter.length} Member${memberFilter.length > 1 ? 's' : ''}`;
  };

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <FilterPopoverItem value="source">
        Source
        <span className="ml-auto text-xs text-muted-foreground">
          {getSourceLabel()}
        </span>
      </FilterPopoverItem>
      <FilterPopoverItem value="channel">
        Channel
        <span className="ml-auto text-xs text-muted-foreground">
          {getChannelLabel()}
        </span>
      </FilterPopoverItem>
      <FilterPopoverItem value="member">
        Member
        <span className="ml-auto text-xs text-muted-foreground">
          {getMemberLabel()}
        </span>
      </FilterPopoverItem>
      <FilterPopoverItem value="date">
        Date
        <span className="ml-auto text-xs text-muted-foreground">
          {getDateLabel()}
        </span>
      </FilterPopoverItem>
    </Command.List>
  );
};

const BackButton = () => {
  const { id } = useFilterPopoverContext();
  const [, setView] = useAtom(getFilterViewState(id));

  return (
    <Command.Item value="back" onSelect={() => setView('root')}>
      <IconChevronLeft className="w-4 h-4" />
      Back
    </Command.Item>
  );
};

const SourceView = () => {
  const { sourceFilter, onSourceFilterChange } = useFilterPopoverContext();

  const handleSourceChange = (value: string) => {
    onSourceFilterChange(value);
  };

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <BackButton />
      {SOURCE_OPTIONS.map((option) => (
        <FilterPopoverCommandItem
          key={option.value}
          value={option.value}
          onSelect={() => handleSourceChange(option.value)}
        >
          <div className="flex items-center gap-2">
            {sourceFilter === option.value && (
              <IconCheck className="size-4" />
            )}
            <span>{option.label}</span>
          </div>
          <Combobox.Check checked={sourceFilter === option.value} />
        </FilterPopoverCommandItem>
      ))}
    </Command.List>
  );
};

const ChannelView = () => {
  const { channelFilter, onChannelFilterChange } = useFilterPopoverContext();
  const { channels, loading: channelsLoading } = useGetChannels();

  const handleChannelChange = (channelId: string) => {
    if (channelId === 'all') {
      onChannelFilterChange([]);
    } else {
      const isSelected = channelFilter.includes(channelId);
      if (isSelected) {
        onChannelFilterChange(channelFilter.filter((id) => id !== channelId));
      } else {
        onChannelFilterChange([...channelFilter, channelId]);
      }
    }
  };

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <BackButton />
      <FilterPopoverCommandItem
        value="all"
        onSelect={() => handleChannelChange('all')}
      >
        <div className="flex items-center gap-2">
          {(!channelFilter || channelFilter.length === 0) && (
            <IconCheck className="size-4" />
          )}
          <span>All Channels</span>
        </div>
        <Combobox.Check
          checked={!channelFilter || channelFilter.length === 0}
        />
      </FilterPopoverCommandItem>
      {channelsLoading ? (
        <Command.Item disabled>Loading channels...</Command.Item>
      ) : (
        channels?.map((channel: IChannel) => (
          <FilterPopoverCommandItem
            key={channel._id}
            value={channel._id}
            onSelect={() => handleChannelChange(channel._id)}
          >
            {channel.name}
            <Combobox.Check checked={channelFilter.includes(channel._id)} />
          </FilterPopoverCommandItem>
        ))
      )}
    </Command.List>
  );
};

const MemberView = () => {
  const { memberFilter, onMemberFilterChange, channelFilter } =
    useFilterPopoverContext();
  const { members: channelMembers } = useGetChannelMembers({
    channelIds: channelFilter,
  });
  const currentUser = useAtomValue(currentUserState) as IUser;
  const [memberSearch, setMemberSearch] = useState('');
  const [debouncedMemberSearch] = useDebounce(memberSearch, 500);

  const excludedMemberIds = useMemo(
    () => channelMembers?.map((m) => m.memberId) || [],
    [channelMembers],
  );

  const { users, loading: usersLoading } = useUsers({
    variables: {
      searchValue: debouncedMemberSearch,
      excludeIds: true,
      ids: [currentUser._id, ...excludedMemberIds],
    },
  });

  const handleMemberChange = (memberId: string) => {
    const isSelected = memberFilter.includes(memberId);
    if (isSelected) {
      onMemberFilterChange(memberFilter.filter((id) => id !== memberId));
    } else {
      onMemberFilterChange([...memberFilter, memberId]);
    }
  };

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <BackButton />
      <Command.Input
        value={memberSearch}
        onValueChange={setMemberSearch}
        placeholder="Search members..."
        variant="secondary"
      />
      {usersLoading ? (
        <Command.Item disabled>Loading members...</Command.Item>
      ) : (
        <>
          {users && users.length > 0 ? (
            users.map((user: IUser) => (
              <FilterPopoverCommandItem
                key={user._id}
                value={user._id}
                onSelect={() => handleMemberChange(user._id)}
              >
                <div className="flex items-center gap-2">
                  <span>{user.details?.fullName || user.email}</span>
                </div>
                <Combobox.Check checked={memberFilter.includes(user._id)} />
              </FilterPopoverCommandItem>
            ))
          ) : (
            <Command.Item disabled>No members found</Command.Item>
          )}
        </>
      )}
    </Command.List>
  );
};

const DateView = () => {
  const { dateValue, onDateValueChange } = useFilterPopoverContext();

  const handleDateChange = (value: string) => {
    onDateValueChange(value);
  };

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <BackButton />
      {DATE_OPTIONS.map((option) => (
        <FilterPopoverCommandItem
          key={option.value}
          value={option.value}
          onSelect={() => handleDateChange(option.value)}
        >
          <div className="flex items-center gap-2">
            {dateValue === option.value && <IconCheck className="size-4" />}
            <span>{option.label}</span>
          </div>
          <Combobox.Check checked={dateValue === option.value} />
        </FilterPopoverCommandItem>
      ))}
    </Command.List>
  );
};

const FilterPopoverContent = ({
  ...props
}: React.ComponentPropsWithoutRef<typeof Combobox.Content>) => {
  return (
    <Combobox.Content
      sideOffset={8}
      className="w-80"
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      <Command shouldFilter={false}>
        <FilterPopoverView filterKey="root">
          <RootView />
        </FilterPopoverView>
        <FilterPopoverView filterKey="source">
          <SourceView />
        </FilterPopoverView>
        <FilterPopoverView filterKey="channel">
          <ChannelView />
        </FilterPopoverView>
        <FilterPopoverView filterKey="member">
          <MemberView />
        </FilterPopoverView>
        <FilterPopoverView filterKey="date">
          <DateView />
        </FilterPopoverView>
      </Command>
    </Combobox.Content>
  );
};

interface FilterPopoverProps {
  id: string;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  dateValue: string;
  onDateValueChange: (value: string) => void;
  channelFilter: string[];
  onChannelFilterChange: (value: string[]) => void;
  memberFilter: string[];
  onMemberFilterChange: (value: string[]) => void;
}

const FilterPopoverRoot = ({
  id,
  sourceFilter,
  onSourceFilterChange,
  dateValue,
  onDateValueChange,
  channelFilter,
  onChannelFilterChange,
  memberFilter,
  onMemberFilterChange,
}: FilterPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useAtom(getFilterViewState(id));

  const getActiveFiltersCount = () => {
    let count = 0;
    if (sourceFilter !== 'all') count++;
    if (dateValue) count++;
    if (channelFilter.length > 0) count++;
    if (memberFilter.length > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const isFiltered = activeFiltersCount > 0;

  return (
    <FilterPopoverProvider
      id={id}
      sourceFilter={sourceFilter}
      onSourceFilterChange={onSourceFilterChange}
      dateValue={dateValue}
      onDateValueChange={onDateValueChange}
      channelFilter={channelFilter}
      onChannelFilterChange={onChannelFilterChange}
      memberFilter={memberFilter}
      onMemberFilterChange={onMemberFilterChange}
    >
      <Popover
        open={open}
        onOpenChange={(op) => {
          setOpen(op);
          if (op) {
            setView('root');
          }
        }}
      >
        <Popover.Trigger asChild>
          <div className="relative inline-block">
            <FilterPopoverTrigger isFiltered={isFiltered} />
            {isFiltered && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-medium bg-primary text-primary-foreground rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
        </Popover.Trigger>
        <FilterPopoverContent />
      </Popover>
    </FilterPopoverProvider>
  );
};

export const FilterPopover = Object.assign(FilterPopoverRoot, {
  Provider: FilterPopoverProvider,
  Trigger: FilterPopoverTrigger,
  Content: FilterPopoverContent,
  Item: FilterPopoverItem,
  CommandItem: FilterPopoverCommandItem,
  View: FilterPopoverView,
});
