import {
  cn,
  Label,
  NavigationMenuGroup,
  Select,
  Sidebar,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  IDataExtensionRecordType,
  useSelectedDataExtensionRecordType,
} from 'ui-modules';

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

const groupByOwner = (recordTypes: IDataExtensionRecordType[]) => {
  const groups = new Map<string, IDataExtensionRecordType[]>();

  for (const recordType of recordTypes) {
    groups.set(recordType.owner, [
      ...(groups.get(recordType.owner) || []),
      recordType,
    ]);
  }

  return Array.from(groups.entries());
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

  return (
    <>
      {groupByOwner(recordTypes).map(([owner, types]) => (
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
        </NavigationMenuGroup>
      ))}
    </>
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
