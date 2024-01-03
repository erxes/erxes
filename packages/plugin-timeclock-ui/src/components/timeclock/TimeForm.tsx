import Form from '@erxes/ui/src/components/form/Form';
import Icon from '@erxes/ui/src/components/Icon';
import { ITimeclock } from '../../types';
import { __ } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import React, { useEffect, useState } from 'react';
import { ControlLabel, FormGroup } from '@erxes/ui/src/components/form';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { prepareCurrentUserOption } from '../../utils';
import { IUser } from '@erxes/ui/src/auth/types';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';

type Props = {
  currentUser: IUser;
  isCurrentUserAdmin: boolean;

  departments: IDepartment[];
  branches: IBranch[];

  queryParams: any;
  selectedUserId: string;
  closeModal: () => void;
  startClockTime: (userId: string) => void;
  stopClockTime: (userId: string, timeId: string) => void;
  timeclocks: ITimeclock[];
  shiftId: string;
  shiftStarted: boolean;
};

const FormComponent = ({
  currentUser,
  isCurrentUserAdmin,
  departments,
  branches,

  startClockTime,
  stopClockTime,
  selectedUserId,
  shiftId,
  shiftStarted,
  closeModal
}: Props) => {
  const returnTotalUserOptions = () => {
    const totalUserOptions: string[] = [];

    for (const dept of departments) {
      totalUserOptions.push(...dept.userIds);
    }

    for (const branch of branches) {
      totalUserOptions.push(...branch.userIds);
    }

    if (currentUser) {
      totalUserOptions.push(currentUser._id);
    }

    return totalUserOptions;
  };

  const filterParams = isCurrentUserAdmin
    ? {}
    : {
        ids: returnTotalUserOptions(),
        excludeIds: false
      };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [userId, setUserId] = useState(selectedUserId);

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
    startClockTime(userId);
    closeModal();
  };

  const stopClock = () => {
    stopClockTime(userId, shiftId);
    closeModal();
  };

  const renderContent = () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px'
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
              filterParams={filterParams}
              customOption={prepareCurrentUserOption(currentUser)}
              label="Choose a team member"
              name="userId"
              customField="employeeId"
              initialValue={selectedUserId}
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
