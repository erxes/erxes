import {
  IconDots,
  IconEdit,
  IconFolder,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import {
  Button,
  Combobox,
  Command,
  DropdownMenu,
  Filter,
  Popover,
  Spinner,
  useConfirm,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Can, useFieldGroups } from 'ui-modules';
import { useFieldGroupRemove } from '../../hooks/useFieldGroupRemove';
import { activePropertyState } from '../../states/activePropertyState';
import { IFieldGroup } from '../../types/Properties';

const GroupFilterItemActions = ({
  group,
  contentType,
}: {
  group: IFieldGroup;
  contentType: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { removeFieldGroup, loading } = useFieldGroupRemove({ contentType });
  const setActivePropertyGroup = useSetAtom(activePropertyState);
  const { confirm } = useConfirm();

  const handleDeleteFieldGroup = () => {
    confirm({
      message: t(
        'confirm-delete-group',
        'Are you sure you want to delete this field group?',
      ),
    }).then(() => removeFieldGroup(group._id));
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 ml-auto opacity-0 group-hover/group-item:opacity-100 data-[state=open]:opacity-100 text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <IconDots className="size-3.5" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="min-w-48"
        onClick={(e) => e.stopPropagation()}
      >
        <Can action="fieldsManage">
          <DropdownMenu.Item asChild>
            <Link to={`/settings/properties/${contentType}/${group._id}/add`}>
              <IconPlus />
              {t('add-field', 'Add field')}
            </Link>
          </DropdownMenu.Item>
        </Can>
        <Can action="fieldGroupsManage">
          <DropdownMenu.Item onClick={() => setActivePropertyGroup(group)}>
            <IconEdit />
            {t('edit', 'Edit')}
          </DropdownMenu.Item>
        </Can>
        <Can action="fieldGroupsManage">
          <DropdownMenu.Item
            className="text-destructive"
            disabled={loading}
            onClick={handleDeleteFieldGroup}
          >
            {loading ? <Spinner size="sm" /> : <IconTrash />}
            {t('delete', 'Delete')}
          </DropdownMenu.Item>
        </Can>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const GroupFilterList = ({
  value,
  contentType,
  onSelect,
}: {
  value?: string;
  contentType: string;
  onSelect: (value: string) => void;
}) => {
  const { fieldGroups } = useFieldGroups({ contentType });

  return (
    <Command>
      <Command.Input placeholder="Search groups" />
      <Command.List>
        <Command.Empty>No groups found</Command.Empty>
        {fieldGroups.map((group) => (
          <Command.Item
            key={group._id}
            value={group._id}
            keywords={[group.name]}
            onSelect={() => onSelect(group._id)}
            className="group/group-item"
          >
            <span className="font-medium truncate">{group.name}</span>
            <Combobox.Check checked={value === group._id} />
            <GroupFilterItemActions group={group} contentType={contentType} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

const GroupFilterValue = ({
  value,
  contentType,
}: {
  value?: string;
  contentType: string;
}) => {
  const { fieldGroups } = useFieldGroups({ contentType });
  const selected = fieldGroups.find((group) => group._id === value);

  if (!selected) {
    return <span className="text-accent-foreground/80">Select group</span>;
  }

  return <span className="font-medium text-sm">{selected.name}</span>;
};

export const PropertiesGroupFilterItem = () => (
  <Filter.Item value="groupId">
    <IconFolder />
    Group
  </Filter.Item>
);

export const PropertiesGroupFilterView = ({
  contentType,
}: {
  contentType: string;
}) => {
  const [groupId, setGroupId] = useQueryState<string>('groupId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="groupId">
      <GroupFilterList
        value={groupId || undefined}
        contentType={contentType}
        onSelect={(value) => {
          setGroupId(value);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

export const PropertiesGroupFilterBar = ({
  contentType,
}: {
  contentType: string;
}) => {
  const [groupId, setGroupId] = useQueryState<string>('groupId');
  const [open, setOpen] = useState(false);

  if (!groupId) {
    return null;
  }

  return (
    <Filter.BarItem queryKey="groupId">
      <Filter.BarName>
        <IconFolder />
        Group
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="groupId">
            <GroupFilterValue value={groupId} contentType={contentType} />
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <GroupFilterList
            value={groupId}
            contentType={contentType}
            onSelect={(value) => {
              setGroupId(value);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};
