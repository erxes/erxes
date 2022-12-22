import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import { ITimeclock } from '../../types';
import { __ } from '@erxes/ui/src/utils';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import TimeForm from '../../containers/timeclock/TimeFormList';

type Props = {
  timeclock: ITimeclock;
};

class Row extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  shiftTrigger = shiftStarted =>
    shiftStarted ? (
      <Button id="timeClockButton1" btnStyle={'danger'} icon="plus-circle">
        End shift
      </Button>
    ) : (
      <>Ended</>
    );

  modalContent = props => (
    <TimeForm
      {...props}
      selectedUserId={
        this.props.timeclock.user ? this.props.timeclock.user._id : null
      }
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
        <td>{timeclock.user ? <NameCard user={timeclock.user} /> : '-'}</td>
        <td>{shiftDate}</td>
        <td>{shiftStartTime}</td>
        <td>{shiftEndTime}</td>
        <td>{this.shiftBtnTrigger(timeclock.shiftActive)}</td>
      </tr>
    );
  }
}

export default Row;
