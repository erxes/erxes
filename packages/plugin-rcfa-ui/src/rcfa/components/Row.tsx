import React from 'react';
import moment from 'moment';
import { ActionButtons, Button, Icon, Label } from '@erxes/ui/src';
import { Link } from 'react-router-dom';
import { IRCFA } from '../../common/types';

type Props = {
  item: IRCFA;
};

class Row extends React.Component<Props> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const { item } = this.props;

    const tableRow = (
      <tr>
        <td>{item.mainType || '-'}</td>
        <td>{item?.mainTypeDetail?.name || '-'}</td>
        <td>
          <Label lblStyle="default">{item.status}</Label>
        </td>
        <td>{moment(item?.createdAt).format('ll HH:mm') || '-'}</td>
        <td>
          {item.closedAt
            ? moment(item.closedAt).format('ll HH:mm') || '-'
            : '-'}
        </td>
        <td>
          <ActionButtons>
            <Button btnStyle="link">
              <Link to={`/rcfa/detail/${item._id}`}>
                <Icon icon="file-search-alt" />
              </Link>
            </Button>
          </ActionButtons>
        </td>
      </tr>
    );

    return tableRow;
  }
}

export default Row;
