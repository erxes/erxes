import { Spinner, Table } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';

import { ITransaction } from '../../../transactions/types';
import ScheduleRow from './ScheduleRow';

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
      <>
        <Table>
          <thead>
            <tr>
              <th>{__('Date')}</th>
              <th>{__('Saving Balance')}</th>
              <th>{__('Income')}</th>
              <th>{__('Stored Interest')}</th>
              <th>{__('Total')}</th>
            </tr>
          </thead>
          <tbody id="schedules">
            {transactions.map(transaction => (
              <ScheduleRow
                transaction={transaction}
                key={transaction._id}
              ></ScheduleRow>
            ))}
          </tbody>
        </Table>
      </>
    );
  }
}

export default withRouter<IRouterProps>(SchedulesList);
