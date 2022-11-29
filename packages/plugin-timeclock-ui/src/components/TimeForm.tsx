import Form from '@erxes/ui/src/components/form/Form';
import Icon from '@erxes/ui/src/components/Icon';
import { ITimeclock } from '../types';
import { IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import React, { useEffect, useState } from 'react';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { ControlLabel, FormGroup } from '@erxes/ui/src/components/form';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

type Props = {
  startTime?: Date;
  queryParams: any;
  currentUserId: string;
  startClockTime: (startTime: Date, userId: string) => void;
  stopClockTime: (stopTime: Date, userId: string, timeId: string) => void;
  timeclocks: ITimeclock[];
};

const sizes = {
  large: {
    padding: '10px 30px',
    fontSize: '13px'
  },
  medium: {
    padding: '7px 20px',
    fontSize: '12px'
  },
  small: {
    padding: '5px 15px',
    fontSize: '10px'
  }
};

const FormComponent = ({
  startClockTime,
  stopClockTime,
  currentUserId,
  timeclocks
}: Props) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userId, setUserId] = useState(currentUserId);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return function cleanup() {
      clearInterval(timer);
    };
  });

  const onTeamMemberSelect = memberId => {
    setUserId(memberId);
  };

  const startClock = () => {
    startClockTime(new Date(), userId);
  };

  const stopClock = () => {
    const last_time_idx = timeclocks.length - 1;
    const timeId = timeclocks[last_time_idx]._id;
    stopClockTime(new Date(), userId, timeId);
  };

  const renderContent = (formProps: IFormProps) => {
    const shiftStarted =
      localStorage.getItem('shiftStarted') === 'true' || false;
    const { values, isSubmitted } = formProps;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'block', fontSize: '26px', fontWeight: 500 }}>
          {currentTime.toLocaleTimeString()}
        </div>
        <div style={{ display: 'block', fontSize: '26px', fontWeight: 500 }}>
          <Button
            btnStyle="primary"
            onClick={shiftStarted ? stopClock : startClock}
          >
            <Icon icon="clock" style={{ display: 'block' }} />
            {shiftStarted ? 'Clock out' : 'Clock in'}
          </Button>
        </div>

        <div style={{ width: '60%' }}>
          <FormGroup>
            <ControlLabel>Team member</ControlLabel>
            <SelectTeamMembers
              label="Choose a team member"
              name="userId"
              initialValue={userId}
              onSelect={onTeamMemberSelect}
              multi={false}
            />
          </FormGroup>
        </div>
      </div>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default FormComponent;
