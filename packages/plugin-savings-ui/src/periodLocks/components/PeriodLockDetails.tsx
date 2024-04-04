import dayjs from 'dayjs';
import { EmptyState, Wrapper } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';

import { IGeneral, IPeriodLockDetail } from '../types';
import DetailInfo from './PeriodLockDetailInfo';
import {
  CollateralTableWrapper,
  ItemLabel,
  ItemValue,
  ScrollTableColls
} from '../../contracts/styles';

import CollapseContent from './CollapseContent';

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
      {
        title: __('PeriodLocks'),
        link: '/erxes-plugin-saving/periodLock-list'
      },
      { title }
    ];

    const renderRow = (value, style?: React.CSSProperties) => {
      return (
        <td style={{ padding: 10 }}>
          <ItemValue style={style}>{value || '-'}</ItemValue>
        </td>
      );
    };

    const renderDtl = (
      dtl?: {
        amount: number;
        account: string;
        side: 'kt' | 'dt';
      }[]
    ) => {
      return (
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <td style={{ padding: 10 }}>
                <ItemLabel>{__('Account')}</ItemLabel>
              </td>
              <td style={{ padding: 10 }}>
                <ItemLabel>{__('Amount')}</ItemLabel>
              </td>
              <td style={{ padding: 10 }}>
                <ItemLabel>{__('Side')}</ItemLabel>
              </td>
            </tr>
          </thead>
          <tbody>
            {dtl?.map(row => (
              <tr>
                {renderRow(row.account)}
                {renderRow(Number(row.amount || 0).toLocaleString(), {
                  textAlign: 'right'
                })}

                {renderRow(row.side, {
                  textAlign: 'right'
                })}
              </tr>
            ))}
          </tbody>
        </table>
      );
    };

    const renderCollateral = (general: IGeneral) => {
      const { amount, generalNumber, payDate, description, dtl } = general;
      return (
        <CollapseContent
          full
          content={renderDtl(dtl)}
          containerParent={({ children }) => (
            <tr>
              <td colSpan={4} style={{ padding: 0 }}>
                {children}
              </td>
            </tr>
          )}
        >
          <tr style={{ cursor: 'pointer' }}>
            {renderRow(generalNumber)}
            {renderRow(Number(amount || 0).toLocaleString(), {
              textAlign: 'right'
            })}
            {renderRow(description, {
              textAlign: 'right'
            })}

            {renderRow(new Date(payDate).toLocaleString(), {
              textAlign: 'right'
            })}
          </tr>
        </CollapseContent>
      );
    };

    const content = () => {
      return (
        <ScrollTableColls style={{ padding: 20 }}>
          <CollateralTableWrapper>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <td style={{ padding: 10 }}>
                    <ItemLabel>{__('number')}</ItemLabel>
                  </td>
                  <td style={{ padding: 10 }}>
                    <ItemLabel>{__('Amount')}</ItemLabel>
                  </td>
                  <td style={{ padding: 10 }}>
                    <ItemLabel>{__('Description')}</ItemLabel>
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
            </table>
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
