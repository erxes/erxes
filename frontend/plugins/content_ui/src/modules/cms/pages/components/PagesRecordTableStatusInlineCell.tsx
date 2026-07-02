import { useMutation } from '@apollo/client';
import { Cell } from '@tanstack/table-core';
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
import { PagesHotKeyScope } from '../types/PagesHotKeyScope';
import { PAGES_EDIT } from '../graphql/mutations/pagesMutations';
export const PagesRecordTableStatusInlineCell = ({
  cell,
}: {
  cell: Cell<any, any>;
}) => {
  const { t } = useTranslation('content');
  const [open, setOpen] = useState(false);
  const status = cell.getValue() as string;
  const [edit, { loading }] = useMutation(PAGES_EDIT);
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
          description: t('page-status-updated-successfully'),
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
      scope={PagesHotKeyScope.PagesTableInlinePopover}
      open={open}
      onOpenChange={setOpen}
    >
      <RecordTableInlineCell.Trigger>
        <div className="w-full flex">
          <Badge
            variant={status === 'published' ? 'success' : 'secondary'}
            className={cn('font-bold', {
              'text-accent-foreground': status !== 'published',
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
            variant={status === 'published' ? 'success' : 'secondary'}
            className={cn('font-bold', {
              'text-accent-foreground': status !== 'published',
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
