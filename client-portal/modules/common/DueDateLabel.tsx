import dayjs from 'dayjs';
import { CloseDateLabel, StartDateLabel } from '../styles/cards';
import * as React from 'react';
import Icon from './Icon';

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

    const generateButtonStart = () => {
      let colorName = 'teal';

      if (startDate) {
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;

        if (new Date(startDate).getTime() - now.getTime() < oneDay) {
          colorName = 'blue';
        }

        if (now > startDate) {
          colorName = 'red';
        }
      }

      return colorName;
    };

    const generateButtonClass = () => {
      let colorName = '';

      if (isComplete) {
        colorName = 'green';
      } else if (closeDate) {
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;

        if (new Date(closeDate).getTime() - now.getTime() < oneDay) {
          colorName = 'yellow';
        }

        if (now > closeDate) {
          colorName = 'red';
        }
      }

      return colorName;
    };
    return (
      <>
        {startDate && (
          <StartDateLabel colorName={generateButtonStart()}>
            <Icon icon="clock-eight" /> {startDay}
          </StartDateLabel>
        )}

        {closeDate && (
          <CloseDateLabel colorName={generateButtonClass()}>
            <Icon icon="clock-eight" /> {day}
          </CloseDateLabel>
        )}
      </>
    );
  }
}

export default DueDateLabel;
