import React from 'react';

import { ActionButtons, Button, Icon, Tip } from '@erxes/ui/src';
import { Link } from 'react-router-dom';
import { IExm } from '../types';

type Props = {
  queryParams: any;
  item: IExm;
  remove: (_id: string) => void;
};

function Row(props: Props) {
  const { item, remove, queryParams } = props;

  const handleRemove = () => {
    remove(item._id);
  };

  return (
    <tr>
      <td>{item?.name || ''}</td>
      <td>
        <ActionButtons>
          <Link to={`/erxes-plugin-exm/home/edit/${item._id}`}>
            <Button btnStyle="link">
              <Tip text="Edit Sync">
                <Icon icon="edit" />
              </Tip>
            </Button>
          </Link>
          <Button btnStyle="link" onClick={handleRemove}>
            <Tip placement="bottom" text="Remove Sync">
              <Icon icon="cancel-1" />
            </Tip>
          </Button>
        </ActionButtons>
      </td>
    </tr>
  );
}

export default Row;
