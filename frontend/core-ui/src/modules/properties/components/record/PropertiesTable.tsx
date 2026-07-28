import { useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { RecordTable, Spinner, Table, useQueryState } from 'erxes-ui';
import { IField, useFieldGroups, useFields } from 'ui-modules';
import { needsToRefreshState } from '../../states/needsToRefresh';
import { propertiesColumns } from './PropertiesColumns';
import { PropertiesCommandBar } from './PropertiesCommandBar';
import { PropertiesRow } from './PropertiesRow';

export const PropertiesTable = () => {
  const { type: contentType } = useParams<{ type: string }>();
  const [groupId] = useQueryState<string>('groupId');
  const navigate = useNavigate();
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const [needsToRefresh, setNeedsToRefresh] = useAtom(needsToRefreshState);
  const { fields, loading, refetch } = useFields({
    contentType: contentType || '',
    groupId: groupId || undefined,
  });
  const { fieldGroups } = useFieldGroups({ contentType: contentType || '' });

  useEffect(() => {
    if (needsToRefresh) {
      refetch();
      setNeedsToRefresh(false);
    }
  }, [needsToRefresh, refetch, setNeedsToRefresh]);

  const groupNameById = useMemo(
    () =>
      Object.fromEntries(fieldGroups.map((group) => [group._id, group.name])),
    [fieldGroups],
  );

  const columns = useMemo(
    () =>
      propertiesColumns(t, {
        groupNameById,
        contentType: contentType || '',
      }),
    [t, groupNameById, contentType],
  );

  const handleRowClick = (field: IField) => {
    navigate(
      `/settings/properties/${contentType}/${field.groupId}/${field._id}`,
    );
  };

  if (loading) return <Spinner containerClassName="py-12" />;

  return (
    <RecordTable.Provider
      columns={columns}
      data={fields}
      stickyColumns={['more', 'checkbox', 'name']}
      className="m-3 rounded-md border"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {fields.length === 0 ? (
              <Table.Row>
                <Table.Cell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t('no-fields-found', 'No fields found')}
                </Table.Cell>
              </Table.Row>
            ) : (
              <RecordTable.RowList
                Row={(props) => (
                  <PropertiesRow {...props} onRowClick={handleRowClick} />
                )}
              />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <PropertiesCommandBar />
    </RecordTable.Provider>
  );
};
