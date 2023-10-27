import { Spinner, Table, Button } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { ScheduleYears } from '../../styles';

import { ISchedule, IScheduleYear } from '../../types';
import ScheduleRow from './ScheduleRow';

interface IProps extends IRouterProps {
  contractId: string;
  schedules: ISchedule[];
  loading: boolean;
  scheduleYears: IScheduleYear[];
  currentYear: number;
  onClickYear: (year: number) => void;
}

class SchedulesList extends React.Component<IProps> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  renderYear() {
    const { scheduleYears, onClickYear } = this.props;
    return scheduleYears.map(item => {
      return (
        <Button key={item.year} onClick={() => onClickYear(item.year)}>
          {item.year}
        </Button>
      );
    });
  }

  render() {
    const { schedules, loading } = this.props;

    if (loading) {
      return <Spinner />;
    }

    return (
      <>
        <ScheduleYears>{this.renderYear()}</ScheduleYears>
        <Table>
          <thead>
            <tr>
              <th />
              <th>{__('Date')}</th>
              <th>{__('Loan Balance')}</th>
              <th>{__('Loan Payment')}</th>
              <th>{__('Interest')}</th>
              <th>{__('Loss')}</th>
              <th>{__('Total')}</th>
            </tr>
          </thead>
          <tbody id="schedules">
            {schedules.map(schedule => (
              <ScheduleRow schedule={schedule} key={schedule._id}></ScheduleRow>
            ))}
          </tbody>
        </Table>
      </>
    );
  }
}

export default withRouter<IRouterProps>(SchedulesList);
