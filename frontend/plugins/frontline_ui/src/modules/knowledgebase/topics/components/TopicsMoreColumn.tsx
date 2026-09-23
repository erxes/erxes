import { IconEdit, IconExternalLink, IconTrash } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useQueryState,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import { useRemoveTopics } from '@/knowledgebase/topics/hooks/useTopicMutations';
import { ITopic } from '@/knowledgebase/types';

const TopicsMoreColumnCell = ({ cell }: { cell: Cell<ITopic, unknown> }) => {
  const { t } = useTranslation('frontline');
  const { _id, title } = cell.row.original;
  const [, setEditId] = useQueryState<string>('editId');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeTopics } = useRemoveTopics();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    setOpen(false);

    confirm({
      message: t('kb-confirm-delete-topic', {
        title: title || t('unnamed-topic'),
        defaultValue:
          'Are you sure you want to delete "{{title}}"? All of its categories and articles will be removed.',
      }),
      options: {
        confirmationValue: 'delete',
        description: t(
          'kb-action-permanent',
          'This action is permanent and cannot be undone.',
        ),
      },
    }).then(async () => {
      try {
        await removeTopics([_id]);
        toast({
          title: t('success'),
          description: t('kb-topic-deleted', 'Topic deleted'),
          variant: 'success',
        });
      } catch (error: unknown) {
        toast({
          title: t('error'),
          description:
            error instanceof Error ? error.message : t('something-went-wrong'),
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="open"
              onSelect={() => {
                setOpen(false);
                navigate(`${KNOWLEDGE_BASE_PATH}/${_id}/articles`);
              }}
            >
              <IconExternalLink /> {t('kb-open-topic', 'Open topic')}
            </Command.Item>
            <Command.Item
              value="edit"
              onSelect={() => {
                setOpen(false);
                setEditId(_id);
              }}
            >
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const topicsMoreColumn: ColumnDef<ITopic> = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: TopicsMoreColumnCell,
  size: 33,
};
