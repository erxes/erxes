import { __, router } from '@erxes/ui/src/utils';
import Table from '@erxes/ui/src/components/table';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import FormControl from '@erxes/ui/src/components/form/Control';
import { useNavigate } from 'react-router-dom';

type Column = {
  key: string;
  label: string;
  render?: Function;
};

type IAction = {
  editForm?: (any) => React.ReactNode;
  deleteForm?: (any) => React.ReactNode;
};

type ICheck = {
  toggleBulk;
  bulk;
  toggleAll;
  emptyBulk;
  isAllSelected;
};

interface IProps {
  columns: Column[];
  data?: object[];
  action?: IAction;
  check?: ICheck;
}

const trigger = (
  <Button btnStyle="link">
    <Tip text={__('Edit')} placement="bottom">
      <Icon icon="edit-3" />
    </Tip>
  </Button>
);

const onClick = (e) => {
  e.stopPropagation();
};

function renderRow(
  data: any,
  columns: Column[],
  action?: IAction,
  check?: ICheck
) {
  const content = (props) =>
    action?.editForm && action?.editForm({ ...props, defaultValue: data });

  const onChange = (e) => {
    if (check?.toggleBulk) {
      check?.toggleBulk(data, e.target.checked);
    }
  };

  return (
    <tr>
      {check && (
        <td onClick={onClick}>
          <FormControl
            checked={(check?.bulk || []).map((b) => b._id).includes(data._id)}
            componentclass="checkbox"
            onChange={onChange}
          />
        </td>
      )}
      {columns.map((row) => {
        if (row.render) return <td key={`${row.key}${data._id}`}>{row.render(data[row.key], data)}</td>;
        return <td key={`${row.key}${data._id}`}>{data[row.key]}</td>;
      })}
      {action && (
        <td>
          <ActionButtons>
            {action?.editForm && (
              <ModalTrigger
                title="Edit basic info"
                trigger={trigger}
                size="xl"
                content={content}
              />
            )}
          </ActionButtons>
        </td>
      )}
    </tr>
  );
}

function CustomTable({
  columns,
  data,
  action,
  check
}: IProps): React.ReactNode {
  const navigate = useNavigate();

  if (data?.length === 0) {
    return (
      <EmptyState icon="comment-info-alt" text="There is no experiments" />
    );
  }

  const onChange = () => {
    check?.toggleAll(data, 'accounts');

    if (check?.bulk.length === data?.length) {
      router.removeParams(navigate, location, 'ids');
      router.setParams(navigate, location, { page: 1 });
    }
  };

  return (
    <Table $hover>
      <thead>
        <tr>
          {check && (
            <td onClick={onClick}>
              <FormControl
                checked={check?.isAllSelected}
                componentclass="checkbox"
                onChange={onChange}
              />
            </td>
          )}
          {columns.map((row) => (
            <th key={`${row.key}`}>{row.label}</th>
          ))}
          {action && <th>ACTIONS</th>}
        </tr>
      </thead>
      <tbody>
        {data?.map((row) => renderRow(row, columns, action, check))}
      </tbody>
    </Table>
  );
}

export default CustomTable;
