import dayjs from 'dayjs';
import { CloseDateLabel } from '../styles/popup';
import Icon from '@erxes/ui/src/components/Icon';
import * as React from 'react';
import { generateButtonClass } from '../utils';

type IProps = {
  closeDate: Date;
  isComplete?: boolean;
};

class DueDateLabel extends React.Component<IProps> {
  render() {
    const { closeDate, isComplete } = this.props;

    if (!closeDate) {
      return null;
    }

    const day = dayjs(closeDate).format('MMM DD');

    return (
      <CloseDateLabel colorName={generateButtonClass(closeDate, isComplete)}>
        <Icon icon="clock-eight" /> {day}
      </CloseDateLabel>
    );
  }
}

export default DueDateLabel;
