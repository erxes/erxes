import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { toast } from 'erxes-ui';
import { Popover, Combobox, Command } from 'erxes-ui';
import { RecordTable } from 'erxes-ui';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';

type PostActionsProps = {
  post: any;
  onDelete: () => void;
};

export function PostActions({ post, onDelete }: PostActionsProps) {
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
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item
              value="remove"
              onSelect={() =>
                confirm({ message: 'Delete this post?' })
                  .then(onDelete)
                  .catch(() => {})
              }
            >
              <IconTrash /> Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
}
