import * as dayjs from 'dayjs';
import { FormControl } from '@erxes/ui/src/components/form';
import Tip from '@erxes/ui/src/components/Tip';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  deal: any;
  history: any;
  isChecked: boolean;
  isUnsynced: boolean;
  toggleBulk: (deal: any, isChecked?: boolean) => void;
  toSync: (dealIds: string[]) => void;
  syncedInfo: any;
};

class Row extends React.Component<Props> {
  render() {
    const { deal, toggleBulk, isChecked, isUnsynced, syncedInfo } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(deal, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const onClickSync = e => {
      e.stopPropagation();
      this.props.toSync([deal._id]);
    };

    const onTrClick = () => {};

    const {
      name,
      amount,
      createdAt,
      stageChangedDate,
      modifiedAt,
      number
    } = deal;

    return (
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{name}</td>
        <td>{number}</td>
        <td>
          {Object.keys(amount).map(a => `${amount[a].toLocaleString()} ${a}`)}
        </td>
        <td>{dayjs(createdAt).format('lll')}</td>
        <td>{dayjs(modifiedAt).format('lll')}</td>
        <td>{dayjs(stageChangedDate).format('lll')}</td>
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
        <td>{syncedInfo.syncedCustomer || ''}</td>
        <td>
          {isUnsynced && (
            <Tip text="Sync">
              <Button btnStyle="link" onClick={onClickSync} icon="sync" />
            </Tip>
          )}
          {isUnsynced === false && syncedInfo.syncedDate && (
            <Tip text="ReSync">
              <Button
                btnStyle="link"
                onClick={onClickSync}
                icon="sync-exclamation"
              />
            </Tip>
          )}
        </td>
      </tr>
    );
  }
}

export default Row;
