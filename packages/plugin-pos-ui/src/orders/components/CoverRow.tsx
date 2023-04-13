import * as dayjs from 'dayjs';
import _ from 'lodash';
import Button from '@erxes/ui/src/components/Button';
import Detail from '../containers/Detail';
import React from 'react';
import { ModalTrigger, confirm } from '@erxes/ui/src';
import { FinanceAmount } from '../../styles';
import { ICover } from '../types';

type Props = {
  cover: ICover;
  history: any;
};

class CoverRow extends React.Component<Props> {
  displayValue(cover, name) {
    const value = _.get(cover, name);
    return <FinanceAmount>{(value || 0).toLocaleString()}</FinanceAmount>;
  }

  displayPaid(cover, key) {
    const { paidAmounts } = cover;
    const value = (
      (paidAmounts || []).filter(pa => pa.title === key || pa.type === key) ||
      []
    ).reduce((sum, pa) => sum + pa.amount, 0);
    return (
      <FinanceAmount key={Math.random()}>
        {(value || 0).toLocaleString()}
      </FinanceAmount>
    );
  }

  modalContent = _props => {
    const { cover } = this.props;
    return <></>;
    // return <Detail cover={cover} />;
  };

  render() {
    const { cover } = this.props;

    const onClick = e => {
      e.stopPropagation();
    };

    const trigger = (
      <tr>
        <td key={'beginDate'}>{cover.beginDate} </td>
        <td key={'endDate'}>{dayjs(cover.endDate).format('lll')}</td>
        <td key={'pos'}>{cover.posName}</td>
        <td key={'user'}>{cover.user ? cover.user.email : ''}</td>
      </tr>
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

export default CoverRow;
