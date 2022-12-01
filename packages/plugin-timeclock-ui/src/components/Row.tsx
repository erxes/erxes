import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import { ITimeclock } from '../types';
import { __ } from '@erxes/ui/src/utils';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const TimeForm = asyncComponent(() => import('../containers/TimeFormList'));

type Props = {
  timeclock: ITimeclock;
};

class Row extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  shiftTrigger = shiftStarted => (
    <Button
      disabled={!shiftStarted && this.props.timeclock.shiftEnd ? true : false}
      id="timeClockButton1"
      btnStyle={shiftStarted ? 'danger' : 'success'}
      icon="plus-circle"
    >
      {`${shiftStarted ? 'End' : 'Start'} Shift`}
    </Button>
  );

  modalContent = props => (
    <TimeForm
      {...props}
      shiftId={this.props.timeclock._id}
      shiftStarted={this.props.timeclock.shiftActive}
    />
  );

  shiftBtnTrigger = shiftStarted => (
    <ModalTrigger
      title={__('Start shift')}
      trigger={this.shiftTrigger(shiftStarted)}
      content={this.modalContent}
    />
  );

  render() {
    const { timeclock } = this.props;
    const shiftStartTime = new Date(timeclock.shiftStart).toLocaleTimeString();
    const shiftDate = new Date(timeclock.shiftStart).toDateString();
    const shiftEndTime = timeclock.shiftActive
      ? '-'
      : new Date(timeclock.shiftEnd).toLocaleTimeString();

    return (
      <tr>
        <td>{<NameCard user={timeclock.user} />}</td>
        <td>{shiftDate}</td>
        <td>{timeclock.shiftActive ? 'Active' : 'Ended'}</td>
        <td>{shiftStartTime}</td>
        <td>{shiftEndTime}</td>
        <td>{this.shiftBtnTrigger(timeclock.shiftActive)}</td>
      </tr>
    );
  }
}

export default Row;
