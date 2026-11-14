import { IconPlus, IconVariable } from '@tabler/icons-react';
import { Button, Label, RecordTable, Spinner, Switch, toast } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IDataExtensionField,
  IDataExtensionRecordType,
  useDataExtensionFields,
  useDataExtensionRecordTypes,
} from 'ui-modules';
import { useDataExtensionPermissions } from '../hooks/useDataExtensionPermissions';
import { getDataExtensionFieldColumns } from './dataExtensionFieldColumns';
import { DataExtensionFieldSheet } from './DataExtensionFieldSheet';
import {
  DataExtensionEmptyState,
  DataExtensionErrorState,
} from './DataExtensionStates';

export const DataExtensionFieldsTable = ({
  recordType,
  sheetOpen,
  onSheetOpenChange,
}: {
  recordType: IDataExtensionRecordType;
  sheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('dataExtensions');
  const { canManage } = useDataExtensionPermissions();
  const { recordTypes } = useDataExtensionRecordTypes();
  const [includeArchived, setIncludeArchived] = useState(false);
  const [editing, setEditing] = useState<IDataExtensionField>();
  const { fields, loading, error, refetch } = useDataExtensionFields({
    recordType: recordType.recordType,
    includeArchived,
  });

  const columns = useMemo(
    () =>
      getDataExtensionFieldColumns({
        t,
        canManage,
        onEdit: (field) => {
          setEditing(field);
          onSheetOpenChange(true);
        },
        recordTypeLabel: (value) =>
          t(
            `record-types.${value}`,
            recordTypes.find((candidate) => candidate.recordType === value)
              ?.label || value,
          ),
      }),
    [t, canManage, onSheetOpenChange, recordTypes],
  );

  const handleSheetOpenChange = (open: boolean) => {
    onSheetOpenChange(open);

    if (!open) {
      setEditing(undefined);
    }
  };

  const renderBody = () => {
    if (loading && !fields.length) {
      return <Spinner />;
    }

    if (error) {
      return (
        <DataExtensionErrorState
          error={error}
          onRetry={() =>
            refetch().catch(() =>
              toast({
                variant: 'destructive',
                title: t('error-description'),
              }),
            )
          }
        />
      );
    }

    if (!fields.length) {
      return (
        <DataExtensionEmptyState
          icon={<IconVariable />}
          title={t('empty.fields-title')}
          description={t('empty.fields-description', {
            label: t(`record-types.${recordType.recordType}`, recordType.label),
          })}
          action={
            canManage && (
              <Button onClick={() => onSheetOpenChange(true)}>
                <IconPlus />
                {t('add-field')}
              </Button>
            )
          }
        />
      );
    }

    return (
      <RecordTable.Provider
        columns={columns}
        data={fields}
        stickyColumns={['more', 'label']}
        className="mt-1.5"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
    );
  };

  return (
    <div className="flex h-full flex-col p-2 pt-0">
      <div className="flex items-center justify-end gap-2 px-1 py-2">
        <Switch
          id="data-extensions-include-archived"
          checked={includeArchived}
          onCheckedChange={setIncludeArchived}
        />
        <Label htmlFor="data-extensions-include-archived">
          {t('show-archived')}
        </Label>
      </div>
      <div className="flex-auto overflow-hidden">{renderBody()}</div>
      {canManage && (
        <DataExtensionFieldSheet
          open={sheetOpen}
          onOpenChange={handleSheetOpenChange}
          recordType={recordType}
          field={editing}
        />
      )}
    </div>
  );
};
