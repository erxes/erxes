import dayjs from 'dayjs';
import { EmptyState, Wrapper } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';

import { IGeneral, IPeriodLockDetail } from '../types';
import DetailInfo from './PeriodLockDetailInfo';
import {
  CollateralColumn,
  CollateralField,
  CollateralTableWrapper,
  ItemLabel,
  ItemValue,
  RowCollateral,
  ScrollTableColls
} from '../../contracts/styles';

type Props = {
  periodLock: IPeriodLockDetail;
  currentUser: IUser;
  saveItem: (doc: IPeriodLockDetail, callback?: (item) => void) => void;
};

type State = {};

class ContractDetails extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const periodLock = props.periodLock;

    this.state = {};
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  render() {
    const { periodLock, saveItem } = this.props;

    const title =
      dayjs(periodLock.date)
        .format('ll')
        .toString() || 'Unknown';

    const breadcrumb = [
      { title: __('PeriodLocks'), link: '/erxes-plugin-loan/periodLock-list' },
      { title }
    ];

    const renderRow = value => {
      return (
        <td style={{ padding: 10 }}>
          <ItemValue>{value || '-'}</ItemValue>
        </td>
      );
    };

    const renderCollateral = (general: IGeneral) => {
      const { amount, generalNumber, payDate } = general;
      return (
        <tr>
          {renderRow(generalNumber)}
          {renderRow(Number(amount || 0).toLocaleString())}

          {renderRow(new Date(payDate).toLocaleString())}
        </tr>
      );
    };

    const content = () => {
      return (
        <ScrollTableColls>
          <CollateralTableWrapper>
            <thead>
              <tr>
                <td style={{ padding: 10 }}>
                  <ItemLabel>{__('number')}</ItemLabel>
                </td>
                <td style={{ padding: 10 }}>
                  <ItemLabel>{__('Amount')}</ItemLabel>
                </td>
                <td style={{ padding: 10 }}>
                  <ItemLabel>{__('Date')}</ItemLabel>
                </td>
              </tr>
            </thead>
            <tbody>
              {periodLock.generals?.map((general, index) =>
                renderCollateral(general)
              )}
            </tbody>
            {periodLock.generals?.length === 0 && (
              <EmptyState icon="list-ul" text="No items" />
            )}
          </CollateralTableWrapper>
        </ScrollTableColls>
      );
    };

    return (
      <Wrapper
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        leftSidebar={<DetailInfo {...this.props} />}
        content={content()}
        transparent={true}
      />
    );
  }
}

export default ContractDetails;
