import * as dayjs from 'dayjs';
import { FormControl } from '@erxes/ui/src/components/form';
import Tip from '@erxes/ui/src/components/Tip';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  order: any;
  history: any;
  isChecked: boolean;
  isUnsynced: boolean;
  toggleBulk: (order: any, isChecked?: boolean) => void;
  toSync: (orderIds: string[]) => void;
  syncedInfo: any;
};

class Row extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const { order, toggleBulk, isChecked, isUnsynced, syncedInfo } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(order, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const onClickSync = e => {
      e.stopPropagation();
      this.props.toSync([order._id]);
    };

    const onTrClick = () => {};
    const { number, createdAt, totalAmount, paidDate } = order;

    return (
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{number}</td>
        <td>{totalAmount.toLocaleString()}</td>
        <td>{dayjs(createdAt).format('lll')}</td>
        <td>{dayjs(paidDate).format('lll')}</td>
        <td onClick={onClick}>
          {isUnsynced && (
            <FormControl
              checked={isUnsynced}
              componentClass="checkbox"
              onChange={onChange}
            />
          )}
        </td>
        <td>
          {syncedInfo?.syncedDate &&
            dayjs(syncedInfo?.syncedDate || '').format('ll')}
        </td>
        <td>{syncedInfo?.syncedBillNumber || ''}</td>
        <td>
          {isUnsynced && (
            <Tip text="Sync">
              <Button btnStyle="link" onClick={onClickSync} icon="sync" />
            </Tip>
          )}
        </td>
      </tr>
    );
  }
}

export default Row;
