import dayjs from 'dayjs';
import { CloseDateLabel, StartDateLabel } from '../styles/popup';
import Icon from '@erxes/ui/src/components/Icon';
import * as React from 'react';
import { generateButtonClass, generateButtonStart } from '../utils';

type IProps = {
  startDate?: Date;
  closeDate: Date;
  isComplete?: boolean;
};

class DueDateLabel extends React.Component<IProps> {
  render() {
    const { startDate, closeDate, isComplete } = this.props;

    if (!closeDate) {
      return null;
    } else if (!startDate) {
      return null;
    }

    const day = dayjs(closeDate).format('MMM DD');
    const startDay = dayjs(startDate).format('MMM DD');

    return (
      <>
        <StartDateLabel colorName={generateButtonStart(startDate)}>
          <Icon icon="clock-eight" /> {startDay}
        </StartDateLabel>

        <CloseDateLabel colorName={generateButtonClass(closeDate, isComplete)}>
          <Icon icon="clock-eight" /> {day}
        </CloseDateLabel>
      </>
    );
  }
}

export default DueDateLabel;
