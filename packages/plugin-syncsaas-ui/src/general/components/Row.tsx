import { Button, Icon, Tip } from '@erxes/ui/src';
import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  queryParams: any;
  item: any;
  remove: (_id: string) => void;
};

class Row extends React.Component<Props> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const { item, remove, queryParams } = this.props;

    const handleRemove = () => {
      remove(item._id);
    };

    const onclick = e => {
      e.stopPropagation();
    };

    return (
      <tr>
        <td>{item?.name || ''}</td>
        <td>{item?.subdomain || ''}</td>
        <td>{moment(item?.startDate).format('ll') || '-'}</td>
        <td>{moment(item?.expireDate).format('ll') || '-'}</td>
        <td onClick={onclick}>
          <Link to={`/settings/sync-saas/edit/${item._id}`}>
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
        </td>
      </tr>
    );
  }
}

export default Row;
