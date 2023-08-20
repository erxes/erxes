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

    const day = closeDate ? dayjs(closeDate).format('MMM DD') : null;
    const startDay = startDate ? dayjs(startDate).format('MMM DD') : null;

    return (
      <>
        {startDate && (
          <StartDateLabel colorName={generateButtonStart(startDate)}>
            <Icon icon="clock-eight" /> {startDay}
          </StartDateLabel>
        )}

        {closeDate && (
          <CloseDateLabel
            colorName={generateButtonClass(closeDate, isComplete)}
          >
            <Icon icon="clock-eight" /> {day}
          </CloseDateLabel>
        )}
      </>
    );
  }
}

export default DueDateLabel;
