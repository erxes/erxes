import * as dayjs from 'dayjs';
import { FormControl } from '@erxes/ui/src/components/form';
import Tip from '@erxes/ui/src/components/Tip';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Detail from '../../containers/PosOrderDetail';

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

  modalContent = _props => {
    const { order } = this.props;

    return <Detail order={order} />;
  };

  render() {
    const { order, toggleBulk, isChecked, isUnsynced, syncedInfo } = this.props;
    const mustBrands = [...(syncedInfo.mustBrands || [])];
    const brandLen = mustBrands.length || 1;

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
          <tr key={`${otherInfo._id}_${ob}`}>
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

    const trigger = (
      <>
        <tr onClick={onTrClick}>
          <td onClick={onClick} rowSpan={brandLen}>
            <FormControl
              checked={isChecked}
              componentClass="checkbox"
              onChange={onChange}
            />
          </td>
          <td rowSpan={brandLen}>{number}</td>
          <td rowSpan={brandLen}>{totalAmount.toLocaleString()}</td>
          <td rowSpan={brandLen}>{dayjs(createdAt).format('lll')}</td>
          <td rowSpan={brandLen}>{dayjs(paidDate).format('lll')}</td>
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
            {firstInfo?.syncedDate &&
              dayjs(firstInfo?.syncedDate || '').format('ll')}
          </td>
          <td>{firstInfo?.syncedBillNumber || ''}</td>
          <td>{firstInfo?.syncedCustomer || ''}</td>
          <td rowSpan={brandLen}>
            {isUnsynced && (
              <Tip text="Sync">
                <Button btnStyle="link" onClick={onClickSync} icon="sync" />
              </Tip>
            )}
            {isUnsynced === false && firstInfo.syncedDate && (
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

    return (
      <ModalTrigger
        title={`Order detail`}
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={this.modalContent}
        size={'lg'}
      />
    );
  }
}

export default Row;
