import { IconEdit, IconEye, IconStairs, IconUser } from '@tabler/icons-react';
import {
  Avatar,
  Combobox,
  Command,
  Filter,
  Popover,
  readImage,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import {
  useMemberInline,
  useUsers,
} from 'ui-modules/modules/team-members/hooks';
import {
  NumberRangeBarItem,
  NumberRangeDialogView,
} from '~/modules/inventories/remainders/products-filter/components/selects/NumberRangeFilter';
import { ACCOUNT_PERMISSIONS } from '../../types/Permission';

type ScopeOption =
  (typeof ACCOUNT_PERMISSIONS)['READ' | 'WRITE'][number];

const splitCsv = (value?: string | null): string[] =>
  (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const joinCsv = (values: string[]): string | null =>
  values.length ? values.join(',') : null;

const toggleValue = (selected: string[], value: string): string[] =>
  selected.includes(value)
    ? selected.filter((v) => v !== value)
    : [...selected, value];

// ───────── User (Team member) filter ─────────
const UserPickerCommand = ({
  selectedId,
  onSelect,
}: {
  selectedId?: string | null;
  onSelect: (userId: string | null) => void;
}) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);
  const { users, loading, handleFetchMore, totalCount, error } = useUsers({
    variables: { searchValue: debouncedSearch },
  });

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        focusOnMount
      />
      <Command.List className="max-h-[300px] overflow-y-auto p-1">
        <Combobox.Empty loading={loading} error={error} />
        {users.map((user) => {
          const fullName = user.details?.fullName || user.email || user._id;
          return (
            <Command.Item
              key={user._id}
              value={user._id}
              onSelect={() => onSelect(user._id)}
            >
              <Avatar size="lg" className="bg-background">
                <Avatar.Image
                  src={readImage(user.details?.avatar as string, 200)}
                />
                <Avatar.Fallback>{fullName.charAt(0)}</Avatar.Fallback>
              </Avatar>
              <span className="truncate">{fullName}</span>
              <Combobox.Check checked={selectedId === user._id} />
            </Command.Item>
          );
        })}
        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          currentLength={users.length}
          totalCount={totalCount}
        />
      </Command.List>
    </Command>
  );
};

const UserBarLabel = ({ userId }: { userId: string }) => {
  const { userDetail } = useMemberInline({
    variables: { _id: userId },
    skip: !userId,
  });
  const fullName = userDetail?.details?.fullName || userDetail?.email || userId;

  return (
    <>
      <Avatar size="lg" className="bg-background">
        <Avatar.Image
          src={readImage(userDetail?.details?.avatar as string, 200)}
        />
        <Avatar.Fallback>{fullName.charAt(0)}</Avatar.Fallback>
      </Avatar>
      <span className="truncate">{fullName}</span>
    </>
  );
};

export const PermissionsFilterUser = () => {
  const [userId, setUserId] = useQueryState<string>('userId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="userId">
      <UserPickerCommand
        selectedId={userId}
        onSelect={(value) => {
          setUserId(value);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

export const FilterBarUser = () => {
  const [userId, setUserId] = useQueryState<string>('userId');
  const [open, setOpen] = useState(false);

  if (!userId) return null;

  return (
    <Filter.BarItem queryKey="userId">
      <Filter.BarName>
        <IconUser />
        User
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="userId">
            <UserBarLabel userId={userId} />
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <UserPickerCommand
            selectedId={userId}
            onSelect={(value) => {
              setUserId(value);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

// ───────── Scope (multi-select, close-on-pick) filter ─────────
const ScopeMultiCommand = ({
  options,
  selected,
  onPick,
}: {
  options: ReadonlyArray<ScopeOption>;
  selected: string[];
  onPick: (next: string[]) => void;
}) => {
  return (
    <Command>
      <Command.Input placeholder="Search" variant="secondary" focusOnMount />
      <Command.List className="p-1">
        <Command.Empty>No results found</Command.Empty>
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <Command.Item
              key={option.value}
              value={option.label}
              onSelect={() => onPick(toggleValue(selected, option.value))}
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              {option.label}
              <Combobox.Check checked={selected.includes(option.value)} />
            </Command.Item>
          );
        })}
      </Command.List>
    </Command>
  );
};

const ScopeChipLabel = ({
  selected,
  options,
}: {
  selected: string[];
  options: ReadonlyArray<ScopeOption>;
}) => (
  <span className="truncate block max-w-full">
    {selected
      .map((s) => options.find((o) => o.value === s)?.label ?? s)
      .join(', ')}
  </span>
);

// ───────── Read scopes ─────────
export const PermissionsFilterReads = () => {
  const [reads, setReads] = useQueryState<string>('reads');
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey="reads">
      <ScopeMultiCommand
        options={ACCOUNT_PERMISSIONS.READ}
        selected={splitCsv(reads)}
        onPick={(next) => {
          setReads(joinCsv(next));
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

export const FilterBarReads = () => {
  const [reads, setReads] = useQueryState<string>('reads');
  const [open, setOpen] = useState(false);
  if (!reads) return null;
  const selected = splitCsv(reads);

  return (
    <Filter.BarItem queryKey="reads">
      <Filter.BarName>
        <IconEye />
        Read
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="reads" className="min-w-0">
            <ScopeChipLabel
              selected={selected}
              options={ACCOUNT_PERMISSIONS.READ}
            />
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <ScopeMultiCommand
            options={ACCOUNT_PERMISSIONS.READ}
            selected={selected}
            onPick={(next) => {
              setReads(joinCsv(next));
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

// ───────── Write scopes ─────────
export const PermissionsFilterWrites = () => {
  const [writes, setWrites] = useQueryState<string>('writes');
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey="writes">
      <ScopeMultiCommand
        options={ACCOUNT_PERMISSIONS.WRITE}
        selected={splitCsv(writes)}
        onPick={(next) => {
          setWrites(joinCsv(next));
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

export const FilterBarWrites = () => {
  const [writes, setWrites] = useQueryState<string>('writes');
  const [open, setOpen] = useState(false);
  if (!writes) return null;
  const selected = splitCsv(writes);

  return (
    <Filter.BarItem queryKey="writes">
      <Filter.BarName>
        <IconEdit />
        Write
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="writes" className="min-w-0">
            <ScopeChipLabel
              selected={selected}
              options={ACCOUNT_PERMISSIONS.WRITE}
            />
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <ScopeMultiCommand
            options={ACCOUNT_PERMISSIONS.WRITE}
            selected={selected}
            onPick={(next) => {
              setWrites(joinCsv(next));
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

// ───────── Level (min + max) range filter ─────────
export const PermissionsFilterLevel = () => (
  <Filter.View filterKey="minLvl" inDialog>
    <NumberRangeDialogView minKey="minLvl" maxKey="maxLvl" label="Level" />
  </Filter.View>
);

export const FilterBarLevel = () => (
  <NumberRangeBarItem
    minKey="minLvl"
    maxKey="maxLvl"
    label="Level"
    icon={<IconStairs size={14} />}
  />
);
