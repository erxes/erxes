import { Spinner, Table } from '@erxes/ui/src';

import { ContractsTableWrapper } from '../../styles';
import { IRouterProps } from '@erxes/ui/src/types';
import { ITransaction } from '../../../transactions/types';
import React from 'react';
import ScheduleRow from './ScheduleRow';
import { __ } from 'coreui/utils';
// import { withRouter } from 'react-router-dom';

interface IProps extends IRouterProps {
  contractId: string;
  transactions: ITransaction[];
  loading: boolean;
  currentYear: number;
  onClickYear: (year: number) => void;
}

class SchedulesList extends React.Component<IProps> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { transactions, loading } = this.props;

    if (loading) {
      return <Spinner />;
    }

    return (
      <ContractsTableWrapper>
        <Table>
          <thead>
            <tr>
              <th>{__('Date')}</th>
              <th>{__('Type')}</th>
              <th>{__('Saving Balance')}</th>
              <th>{__('Amount')}</th>
              <th>{__('Stored Interest')}</th>
              <th>{__('Total')}</th>
            </tr>
          </thead>
          <tbody id="schedules">
            {transactions.map((transaction) => (
              <ScheduleRow
                transaction={transaction}
                key={transaction._id}
              ></ScheduleRow>
            ))}
          </tbody>
        </Table>
      </ContractsTableWrapper>
    );
  }
}

export default SchedulesList;
