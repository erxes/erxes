import { useMutation } from '@apollo/client';
import type { Cell } from '@tanstack/react-table';
import {
  Badge,
  cn,
  PopoverScoped,
  RecordTableInlineCell,
  Spinner,
  Switch,
  toast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PostsHotKeyScope } from '../types/PostsHotKeyScope';
import { CMS_POSTS_EDIT } from '@/cms/posts/graphql';
import type { PostEditVariables } from '@/cms/posts/types';
import type { Posts } from '@/cms/posts/types/postsType';

interface EditPostStatusResponse {
  cmsPostsEdit?: Pick<Posts, '_id' | 'status'> | null;
}

export const PostsRecordTableStatusInlineCell = ({
  cell,
}: {
  cell: Cell<Posts, unknown>;
}) => {
  const { t } = useTranslation('content');
  const [open, setOpen] = useState(false);
  const status = cell.getValue<Posts['status']>();
  const [edit, { loading }] = useMutation<
    EditPostStatusResponse,
    PostEditVariables
  >(CMS_POSTS_EDIT);

  const onSave = (isChecked: boolean) => {
    edit({
      variables: {
        id: cell.row.original._id,
        input: {
          status: isChecked ? 'published' : 'draft',
        },
      },
      onCompleted: () => {
        setOpen(false);
        toast({
          title: t('success'),
          description: t('post-status-updated-successfully'),
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };
  return (
    <PopoverScoped
      scope={PostsHotKeyScope.PostsTableInlinePopover}
      open={open}
      onOpenChange={setOpen}
    >
      <RecordTableInlineCell.Trigger>
        <div className="w-full flex">
          <Badge
            variant={
              status === 'published'
                ? 'success'
                : status === 'scheduled'
                  ? 'warning'
                  : 'secondary'
            }
            className={cn('font-bold', {
              'text-accent-foreground':
                status !== 'published' && status !== 'scheduled',
            })}
          >
            {status}
            {loading && <Spinner />}
          </Badge>
        </div>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="h-cell ">
        <div className="w-full flex h-full py-1 px-2 gap-2">
          <Badge
            variant={
              status === 'published'
                ? 'success'
                : status === 'scheduled'
                  ? 'warning'
                  : 'secondary'
            }
            className={cn('font-bold', {
              'text-accent-foreground':
                status !== 'published' && status !== 'scheduled',
            })}
          >
            {status}
          </Badge>
          <Switch
            id="mode"
            disabled={loading}
            onCheckedChange={(isChecked) => onSave(isChecked)}
            checked={status === 'published'}
          />
        </div>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
