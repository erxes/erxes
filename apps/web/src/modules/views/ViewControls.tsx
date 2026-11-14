import type { ViewRecordType } from '@erxes/core-contract';
import { IconArrowBackUp, IconCopyPlus, IconDeviceFloppy } from '@tabler/icons-react';
import { Button, Dialog, Input, Label, Switch } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconTip } from '~/components/IconTip';
import { useCanShareViews, useViewMutations, useViewState } from './useViews';

interface ViewValues {
  name: string;
  shared: boolean;
}

/** Mounted each time the dialog opens, so it starts from `initial`. */
const ViewForm = ({
  recordType,
  initial,
  onSave,
  pending,
}: {
  recordType: ViewRecordType;
  initial: ViewValues;
  onSave: (value: ViewValues) => void;
  pending: boolean;
}) => {
  const { t } = useTranslation('views');
  const canShare = useCanShareViews(recordType);
  const [name, setName] = useState(initial.name);
  const [shared, setShared] = useState(initial.shared);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();

        if (name.trim()) onSave({ name: name.trim(), shared });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="view-name">{t('name')}</Label>
        <Input
          id="view-name"
          value={name}
          maxLength={80}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      {canShare && (
        <div className="flex items-center gap-2 text-sm">
          <Switch id="view-shared" checked={shared} onCheckedChange={setShared} />
          <Label htmlFor="view-shared" variant="option">
            {t('share')}
          </Label>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={!name.trim() || pending}>
        {t('save')}
      </Button>
    </form>
  );
};

export const ViewDialog = ({
  recordType,
  open,
  onOpenChange,
  title,
  initial,
  onSave,
  pending,
}: {
  recordType: ViewRecordType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initial: ViewValues;
  onSave: (value: ViewValues) => void;
  pending: boolean;
}) => {
  const { t } = useTranslation('views');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="sm:max-w-md">
        <Dialog.HeaderCombined title={title} description={t('save-description')} />
        <ViewForm recordType={recordType} initial={initial} onSave={onSave} pending={pending} />
      </Dialog.Content>
    </Dialog>
  );
};

/**
 * While the list differs from the open view: reset it, save the changes to a
 * view of one's own, or save the list as a new view.
 */
export const ViewChanges = ({ recordType }: { recordType: ViewRecordType }) => {
  const { t } = useTranslation('views');
  const { current, changed, query } = useViewState(recordType);
  const { create, update } = useViewMutations(recordType);
  const [open, setOpen] = useState(false);

  if (!changed) return null;

  const values = { filter: query.advanced, search: query.search || null };
  const saveNew = current ? t('save-new') : t('save');

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <IconTip label={t('reset')}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('reset')}
          tone="muted"
          onClick={() => query.openView(current)}
        >
          <IconArrowBackUp />
        </Button>
      </IconTip>
      {current?.editable ? (
        <>
          <IconTip label={t('update', { name: current.name })}>
            <Button
              size="sm"
              variant="secondary"
              className="h-7"
              disabled={update.isPending}
              onClick={() => update.mutate({ id: current.id, ...values })}
            >
              <IconDeviceFloppy />
              {t('save-changes')}
            </Button>
          </IconTip>
          <IconTip label={saveNew}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={saveNew}
              tone="muted"
              onClick={() => setOpen(true)}
            >
              <IconCopyPlus />
            </Button>
          </IconTip>
        </>
      ) : (
        <Button size="sm" variant="secondary" className="h-7" onClick={() => setOpen(true)}>
          <IconDeviceFloppy />
          {saveNew}
        </Button>
      )}
      <ViewDialog
        recordType={recordType}
        open={open}
        onOpenChange={setOpen}
        title={t('save')}
        initial={{ name: '', shared: false }}
        pending={create.isPending}
        onSave={({ name, shared }) =>
          create.mutate(
            { recordType, name, shared, ...values },
            {
              onSuccess: (view) => {
                setOpen(false);
                query.openView(view);
              },
            },
          )
        }
      />
    </div>
  );
};
