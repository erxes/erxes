import Table from '@erxes/ui/src/components/table';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import React from 'react';

type Column = {
  key: string;
  label: string;
  render?: Function;
};

interface IProps {
  columns:Column[];
  data?: object[];
}

function renderRow(
  data: object,
  columns: Column[]
) {
  return (
    <tr>
      {columns.map((row) => {
        if (row.render) return <td>{row.render(data[row.key], data)}</td>;
        return <td>{data[row.key]}</td>;
      })}
    </tr>
  );
}

function CustomTable({ columns, data }: IProps): React.ReactNode {
  if (data?.length === 0) {
    return (
      <EmptyState icon="comment-info-alt" text="There is no experiments" />
    );
  }
  return (
    <Table $hover>
      <thead>
        <tr>
          {columns.map((row) => (
            <th>{row.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>{data?.map((row) => renderRow(row, columns))}</tbody>
    </Table>
  );
}

export default CustomTable;
