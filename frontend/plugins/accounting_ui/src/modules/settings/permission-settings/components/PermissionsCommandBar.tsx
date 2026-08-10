import { IconDeviceFloppy } from '@tabler/icons-react';
import { Button, CommandBar, Input, RecordTable, Separator } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissionEdit } from '../hooks/usePermissionEdit';
import {
  ACCOUNT_PERMISSIONS,
  IPermission,
  PermissionReadScope,
  PermissionWriteScope,
} from '../types/Permission';
import { PermissionScopeSelect } from './PermissionsColumns';

export const PermissionsCommandbar = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  const selected = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original as IPermission);

  return (
    <CommandBar open={selected.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selected.length} {t('selected')}</CommandBar.Value>
        <Separator.Inline />
        <PermissionsBulkEditor selected={selected} />
      </CommandBar.Bar>
    </CommandBar>
  );
};

const PermissionsBulkEditor = ({ selected }: { selected: IPermission[] }) => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  const { editPermissionsBulk, loading } = usePermissionEdit();
  const [level, setLevel] = useState<string>('');
  const [read, setRead] = useState<string | undefined>();
  const [write, setWrite] = useState<string | undefined>();

  const handleSave = () => {
    const changes: {
      read?: PermissionReadScope;
      write?: PermissionWriteScope;
      level?: number;
    } = {};
    if (read) changes.read = read as PermissionReadScope;
    if (write) changes.write = write as PermissionWriteScope;
    if (level !== '') {
      const n = Number(level);
      if (!Number.isNaN(n)) changes.level = n;
    }
    if (!Object.keys(changes).length) return;
    const promise = editPermissionsBulk(selected, changes);
    Promise.resolve(promise).then(() => {
      table.resetRowSelection();
      setLevel('');
      setRead(undefined);
      setWrite(undefined);
    });
  };

  const canSave =
    !loading &&
    selected.length > 0 &&
    (read !== undefined || write !== undefined || level !== '');

  return (
    <>
      <div className="w-44">
        <Input
          type="number"
          inputMode="numeric"
          value={level}
          placeholder={t('level')}
          className="h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          onChange={(e) => setLevel(e.target.value)}
        />
      </div>
      <div className="w-44">
        <PermissionScopeSelect
          value={read}
          options={ACCOUNT_PERMISSIONS.READ}
          placeholder={t('read')}
          triggerVariant="outline"
          hideChevron={false}
          triggerClassName="h-8 w-full font-normal"
          onChange={(next) => setRead(next)}
        />
      </div>
      <div className="w-44">
        <PermissionScopeSelect
          value={write}
          options={ACCOUNT_PERMISSIONS.WRITE}
          placeholder={t('write')}
          triggerVariant="outline"
          hideChevron={false}
          triggerClassName="h-8 w-full font-normal"
          onChange={(next) => setWrite(next)}
        />
      </div>
      <Button variant="secondary" disabled={!canSave} onClick={handleSave}>
        <IconDeviceFloppy />
        {t('save')}
      </Button>
    </>
  );
};
