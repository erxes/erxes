import { getCurrentDate, monthColumns } from '@erxes/ui/src/utils/calendar';
import React from 'react';
import dayjs from 'dayjs';
import { IDateColumn } from '@erxes/ui/src/types';

type State = { currentDate: dayjs.Dayjs };

type Props = {
  date: IDateColumn;
};

class TimeView extends React.Component<Props, State> {
  state = { currentDate: getCurrentDate() };

  renderColumns(index: number, date: IDateColumn) {
    return (
      <div>
        {date.year} - {date.month}
      </div>
    );
  }

  renderMonths = () => {
    const { currentDate } = this.state;
    const months = monthColumns(currentDate, 3);

    return months.map((date: IDateColumn, index: number) =>
      this.renderColumns(index, date)
    );
  };

  render() {
    const { currentDate } = this.state;

    return <div>{this.renderMonths()}</div>;
  }
}

export default TimeView;
