import { ReactNode, useMemo } from 'react';
import { IField, IFieldGroup } from '../types/fieldsTypes';
import { buildGroupRows } from '../utils/groupLayout';
import { GridRows } from './GridRows';

export const GroupFieldRows = ({
  group,
  fields,
  renderField,
}: {
  group: IFieldGroup;
  fields: IField[];
  renderField: (field: IField) => ReactNode;
}) => {
  const rows = useMemo(
    () =>
      buildGroupRows(group, fields).map((row) => ({
        items: row.fields,
        columns: row.columns,
      })),
    [group, fields],
  );

  return (
    <GridRows rows={rows} getKey={(field) => field._id} render={renderField} />
  );
};
