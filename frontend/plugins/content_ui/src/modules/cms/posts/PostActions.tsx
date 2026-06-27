import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Posts } from './types/postsType';

type PostActionsProps = {
  post: Posts;
  onDelete: () => void | Promise<void>;
};

export function PostActions({ post, onDelete }: PostActionsProps) {
  const { t } = useTranslation('content');
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { websiteId } = useParams();

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() =>
                navigate(`/content/cms/${websiteId}/posts/add`, {
                  state: { post },
                })
              }
            >
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item
              value="remove"
              onSelect={() =>
                confirm({ message: t('confirm-delete-this-post') })
                  .then(() => onDelete())
                  .catch(() => undefined)
              }
            >
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
}
