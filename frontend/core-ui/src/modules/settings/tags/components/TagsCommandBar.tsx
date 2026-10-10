import { useTranslation } from 'react-i18next';
import { useTagsContext } from '@/settings/tags/context/TagsContext';
import { useTagsBulkActions } from '@/settings/tags/hooks/useTagsBulkActions';
import { TagTableRow, useTagsView } from '@/settings/tags/hooks/useTagsView';
import {
  IconArrowsMove,
  IconCirclesFilled,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  CommandBar,
  Popover,
  RecordTable,
  Separator,
  Tooltip,
  useConfirm,
} from 'erxes-ui';
import { Can } from 'ui-modules';
import { useTagsCrud } from '../hooks/useTagsCrud';

const MoveToGroupButton = ({
  groups,
  rows,
  canMove,
  moveDisabledReason,
}: {
  groups: TagTableRow[];
  rows: TagTableRow[];
  canMove: boolean;
  moveDisabledReason: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });
  const { type } = useTagsView();
  const { editTag } = useTagsCrud(type);
  const { clearSelection } = useTagsBulkActions();

  const handleMove = async (parentId: string | null) => {
    await Promise.all(
      rows.map((row) =>
        editTag({
          id: row._id,
          parentId,
        }),
      ),
    );

    clearSelection();
  };

  const button = (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="secondary" disabled={!canMove}>
          <IconArrowsMove />
          {t('move-to-group')}
        </Button>
      </Popover.Trigger>
      <Combobox.Content className="min-w-56">
        <Command>
          <Command.Input placeholder={t('select-destination-group')} />
          <Command.List>
            {/* <Command.Item onSelect={() => handleMove(null)}>
              No group
            </Command.Item> */}
            {groups.map((group) => (
              <Command.Item
                key={group._id}
                onSelect={() => handleMove(group._id)}
              >
                <IconCirclesFilled
                  className="size-3!"
                  style={{ color: group.colorCode }}
                />
                {group.name}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );

  if (canMove) {
    return button;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>{button}</Tooltip.Trigger>
        <Tooltip.Content>{moveDisabledReason}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const TagsCommandBar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });
  const { table } = RecordTable.useRecordTable();
  const { draft } = useTagsContext();
  const { type, tagGroups } = useTagsView();
  const { removeTag } = useTagsCrud(type);
  const { confirm } = useConfirm();
  const { selectedRows, count, canMove, moveDisabledReason, clearSelection } =
    useTagsBulkActions();

  const handleDelete = () => {
    confirm({
      message: t('confirm-delete-selected', { total: count }),
      options: {
        confirmationValue: 'delete',
      },
    }).then(async () => {
      await Promise.all(selectedRows.map((row) => removeTag(row._id)));
      clearSelection();
    });
  };

  return (
    <CommandBar open={!draft && count > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {t('selected-count', { total: count })}
        </CommandBar.Value>
        <Can action="tagsDelete">
          <>
            <Separator.Inline />
            <Button variant="secondary" onClick={handleDelete}>
              <IconTrash />
              {t('delete')}
            </Button>
          </>
        </Can>
        <Can action="tagsUpdate">
          <>
            <Separator.Inline />
            <MoveToGroupButton
              groups={tagGroups}
              rows={selectedRows}
              canMove={canMove}
              moveDisabledReason={moveDisabledReason}
            />
          </>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
