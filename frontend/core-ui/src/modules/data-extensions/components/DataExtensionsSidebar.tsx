import { IconArchiveOff, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  cn,
  Label,
  NavigationMenuGroup,
  Select,
  Sidebar,
  toast,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  IDataExtensionObject,
  IDataExtensionRecordType,
  useSelectedDataExtensionRecordType,
} from 'ui-modules';
import {
  useDataExtensionObjectMutations,
  useDataExtensionObjects,
} from '../hooks/useDataExtensionObjects';
import { useDataExtensionPermissions } from '../hooks/useDataExtensionPermissions';
import { DataExtensionObjectIcon } from './DataExtensionObjectIcon';
import { DataExtensionObjectSheet } from './DataExtensionObjectSheet';

const RecordTypeMenuItem = ({
  recordType,
  isActive,
}: {
  recordType: IDataExtensionRecordType;
  isActive: boolean;
}) => {
  const { t } = useTranslation('dataExtensions');

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton isActive={isActive} asChild>
        <Link to={`?recordType=${encodeURIComponent(recordType.recordType)}`}>
          {recordType.custom && (
            <DataExtensionObjectIcon
              icon={recordType.icon}
              className="text-muted-foreground"
            />
          )}
          <span className="min-w-0 flex-1 truncate">
            {t(`record-types.${recordType.recordType}`, recordType.label)}
          </span>
          {recordType.fieldCount > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {recordType.fieldCount}
            </span>
          )}
        </Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};

/** Module groups first; tenant-defined objects get a group of their own. */
const groupByOwner = (recordTypes: IDataExtensionRecordType[]) => {
  const groups = new Map<string, IDataExtensionRecordType[]>();

  for (const recordType of recordTypes) {
    const group = recordType.custom ? 'custom' : recordType.owner;

    groups.set(group, [...(groups.get(group) || []), recordType]);
  }

  return Array.from(groups.entries());
};

const ArchivedObjectItem = ({ object }: { object: IDataExtensionObject }) => {
  const { t } = useTranslation('dataExtensions');
  const { confirm } = useConfirm();
  const { restoreObject, deleteObject, saving } =
    useDataExtensionObjectMutations();
  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      toast({ variant: 'success', title: success });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('objects.toast.action-failed'),
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  return (
    <Sidebar.MenuItem>
      <div className="flex h-8 items-center gap-2 px-2 text-sm text-muted-foreground">
        <DataExtensionObjectIcon icon={object.icon} />
        <span className="min-w-0 flex-1 truncate">{object.pluralLabel}</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          disabled={saving}
          title={t('objects.restore')}
          aria-label={t('objects.restore-named', { label: object.pluralLabel })}
          onClick={() =>
            run(
              () => restoreObject(object._id),
              t('objects.toast.restored', { label: object.pluralLabel }),
            )
          }
        >
          <IconArchiveOff />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-destructive"
          disabled={saving}
          title={t('objects.delete')}
          aria-label={t('objects.delete-named', { label: object.pluralLabel })}
          onClick={() =>
            confirm({
              message: t('objects.delete-confirm', { label: object.pluralLabel }),
              options: {
                description: t('objects.delete-confirm-description'),
                okLabel: t('delete'),
                confirmationValue: object.key,
                variants: { ok: 'destructive' },
              },
            }).then(() =>
              run(
                () => deleteObject(object._id),
                t('objects.toast.deleted', { label: object.pluralLabel }),
              ),
            )
          }
        >
          <IconTrash />
        </Button>
      </div>
    </Sidebar.MenuItem>
  );
};

/** Archived objects keep their records until deleted here. */
const ArchivedObjects = () => {
  const { t } = useTranslation('dataExtensions');
  const { objects } = useDataExtensionObjects();
  const archived = objects.filter((object) => object.status === 'archived');

  if (!archived.length) {
    return null;
  }

  return (
    <NavigationMenuGroup name={t('objects.archived')}>
      {archived.map((object) => (
        <ArchivedObjectItem key={object._id} object={object} />
      ))}
    </NavigationMenuGroup>
  );
};

/** Record types grouped by the module that owns them. */
export const DataExtensionsContextNavigation = () => {
  const { t } = useTranslation('dataExtensions');
  const [selected] = useQueryState<string>('recordType');
  const {
    recordType: active,
    recordTypes,
    loading,
  } = useSelectedDataExtensionRecordType();

  if (loading && !recordTypes.length) {
    return (
      <NavigationMenuGroup name={t('record-types-title')}>
        <Sidebar.MenuSkeleton />
        <Sidebar.MenuSkeleton />
        <Sidebar.MenuSkeleton />
      </NavigationMenuGroup>
    );
  }

  const groups = groupByOwner(recordTypes);

  return (
    <>
      {groups.map(([owner, types]) => (
        <NavigationMenuGroup key={owner} name={t(`owners.${owner}`, owner)}>
          {types.map((recordType) => (
            <RecordTypeMenuItem
              key={recordType.recordType}
              recordType={recordType}
              isActive={
                (selected || active?.recordType) === recordType.recordType
              }
            />
          ))}
          {owner === 'custom' && <NewObjectItem />}
        </NavigationMenuGroup>
      ))}
      {!groups.some(([owner]) => owner === 'custom') && (
        <NavigationMenuGroup name={t('owners.custom')}>
          <NewObjectItem />
        </NavigationMenuGroup>
      )}
      <ArchivedObjects />
    </>
  );
};

const NewObjectItem = () => {
  const { t } = useTranslation('dataExtensions');
  const { canManage } = useDataExtensionPermissions();
  const [open, setOpen] = useState(false);

  if (!canManage) {
    return null;
  }

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton
        className="text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <IconPlus />
        <span>{t('objects.new')}</span>
      </Sidebar.MenuButton>
      <DataExtensionObjectSheet open={open} onOpenChange={setOpen} />
    </Sidebar.MenuItem>
  );
};

/** Record type picker for narrow screens, where the app sidebar hides. */
export const DataExtensionsMobileSidebar = ({
  className,
}: {
  className?: string;
}) => {
  const { t } = useTranslation('dataExtensions');
  const [, setSelected] = useQueryState<string>('recordType');
  const { recordType: active, recordTypes } =
    useSelectedDataExtensionRecordType();

  return (
    <div className={cn('flex flex-col gap-1 px-3 pt-3', className)}>
      <Label htmlFor="data-extensions-record-type-picker">
        {t('record-types-title')}
      </Label>
      <Select
        value={active?.recordType}
        onValueChange={(value) => setSelected(value)}
      >
        <Select.Trigger id="data-extensions-record-type-picker">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {recordTypes.map((recordType) => (
            <Select.Item
              key={recordType.recordType}
              value={recordType.recordType}
            >
              {t(`record-types.${recordType.recordType}`, recordType.label)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
};
