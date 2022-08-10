import * as dayjs from 'dayjs';
import { FormControl } from '@erxes/ui/src/components/form';
import Tip from '@erxes/ui/src/components/Tip';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  posOrder: any;
  history: any;
  isChecked: boolean;
  isUnsynced: boolean;
  toggleBulk: (deal: any, isChecked?: boolean) => void;
  toSync: (dealIds: string[]) => void;
  syncedInfo: any;
};

class Row extends React.Component<Props> {
  render() {
    const {
      posOrder,
      toggleBulk,
      isChecked,
      isUnsynced,
      syncedInfo
    } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(posOrder, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const onClickSync = e => {
      e.stopPropagation();
      this.props.toSync([posOrder._id]);
    };

    const onTrClick = () => {};

    const { posToken, createdAt, totalAmount, paidDate } = posOrder;

    return (
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{posToken}</td>
        <td>
          {Object.keys(totalAmount).map(
            a => `${totalAmount[a].toLocaleString()} ${a}`
          )}
        </td>
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
          {syncedInfo.syncedDate &&
            dayjs(syncedInfo.syncedDate || '').format('ll')}
        </td>
        <td>{syncedInfo.syncedBillNumber || ''}</td>
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
