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
    const mustBrands = [...(syncedInfo.mustBrands || [])];
    const brandLen = mustBrands.length || 1;

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
    const firstBrand = mustBrands[0] || '';
    const firstInfo = syncedInfo[firstBrand] || {};
    const otherBrands = mustBrands.splice(1, brandLen) || [];

    const renderOtherTr = () => {
      if (!otherBrands.length) {
        return <></>;
      }

      return otherBrands.map(ob => {
        const otherInfo = syncedInfo[ob] || {};

        return (
          <tr key={`${otherInfo._id}_${otherInfo.brandName || ''}`}>
            <td>{otherInfo.brandName || ''}</td>
            <td>
              {otherInfo.syncedDate &&
                dayjs(otherInfo.syncedDate || '').format('ll')}
            </td>
            <td>{otherInfo.syncedBillNumber || ''}</td>
            <td>{otherInfo.syncedCustomer || ''}</td>
          </tr>
        );
      });
    };

    return (
      <>
        <tr onClick={onTrClick}>
          <td onClick={onClick} rowSpan={brandLen}>
            <FormControl
              checked={isChecked}
              componentClass="checkbox"
              onChange={onChange}
            />
          </td>
          <td rowSpan={brandLen}>{name}</td>
          <td rowSpan={brandLen}>{number}</td>
          <td rowSpan={brandLen}>
            {Object.keys(amount).map(a => `${amount[a].toLocaleString()} ${a}`)}
          </td>
          <td rowSpan={brandLen}>{dayjs(createdAt).format('lll')}</td>
          <td rowSpan={brandLen}>{dayjs(modifiedAt).format('lll')}</td>
          <td rowSpan={brandLen}>{dayjs(stageChangedDate).format('lll')}</td>
          <td onClick={onClick} rowSpan={brandLen}>
            {isUnsynced && (
              <FormControl
                checked={isUnsynced}
                componentClass="checkbox"
                onChange={onChange}
              />
            )}
          </td>

          <td>{firstInfo.brandName || ''}</td>
          <td>
            {firstInfo.syncedDate &&
              dayjs(firstInfo.syncedDate || '').format('ll')}
          </td>
          <td>{firstInfo.syncedBillNumber || ''}</td>
          <td>{firstInfo.syncedCustomer || ''}</td>
          <td rowSpan={brandLen}>
            {isUnsynced && (
              <Tip text="Sync">
                <Button btnStyle="link" onClick={onClickSync} icon="sync" />
              </Tip>
            )}
            {isUnsynced === false && (
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
        {renderOtherTr()}
      </>
    );
  }
}

export default Row;
