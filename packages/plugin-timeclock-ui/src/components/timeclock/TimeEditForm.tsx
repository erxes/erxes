import React, { useState } from 'react';
import { ControlLabel, FormControl } from '@erxes/ui/src/components/form';
import {
  CustomRangeContainer,
  FlexCenter,
  FlexColumn,
  FlexRow,
  FlexRowEven
} from '../../styles';
import { ITimeclock } from '../../types';
import { IFormProps } from '@erxes/ui/src/types';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import { Alert } from '@erxes/ui/src/utils';
import Form from '@erxes/ui/src/components/form/Form';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  timeclock: ITimeclock;

  contentProps: any;

  timeclockEdit: (values: any) => void;
};
export const TimeEditForm = (props: Props) => {
  const { timeclock, contentProps, timeclockEdit } = props;

  const { closeModal } = contentProps;

  const [shiftStartInsert, setShiftStartInsert] = useState(
    timeclock.shiftStart
  );

  const [shiftEndInsert, setShiftEndInsert] = useState(
    timeclock.shiftEnd || timeclock.shiftStart
  );

  const [shiftEnded, setShiftEnded] = useState(!timeclock.shiftActive);

  const onShiftStartInsertChange = date => {
    setShiftStartInsert(date);
  };

  const onShiftEndInsertChange = date => {
    setShiftEndInsert(date);
  };

  const toggleShiftActive = e => {
    setShiftEnded(e.target.checked);
  };

  const editTimeClock = () => {
    const values = generateDoc();

    if (checkInput()) {
      timeclockEdit(values);
      closeModal();
    }
  };
  const generateDoc = () => {
    checkInput();

    let outDeviceType;
    let inDeviceType;

    if (shiftStartInsert !== timeclock.shiftStart) {
      inDeviceType = 'edit';
    }

    if (!shiftEnded) {
      return {
        _id: timeclock._id,
        shiftStart: shiftStartInsert,
        shiftActive: true,
        inDeviceType
      };
    }

    if (shiftEndInsert !== timeclock.shiftEnd) {
      outDeviceType = 'edit';
    }

    return {
      _id: timeclock._id,
      shiftStart: shiftStartInsert,
      shiftEnd: shiftEndInsert,
      shiftActive: false,
      inDeviceType,
      outDeviceType
    };
  };

  const checkInput = () => {
    if (
      shiftEnded &&
      shiftStartInsert &&
      shiftEndInsert &&
      new Date(shiftEndInsert).getTime() < new Date(shiftStartInsert).getTime()
    ) {
      Alert.error('Shift end can not be sooner than shift start');
      return false;
    }

    return true;
  };

  const renderTimelogForm = (formProps: IFormProps) => {
    return (
      <FlexColumn marginNum={20}>
        <div>
          {timeclock.user &&
            timeclock.user.details &&
            timeclock.user.details.fullName}
        </div>
        <ControlLabel>Shift Start</ControlLabel>

        <CustomRangeContainer>
          <DateControl
            value={shiftStartInsert}
            name="startDate"
            placeholder={'Starting date'}
            dateFormat={'YYYY-MM-DD'}
            timeFormat={'HH:mm'}
            onChange={onShiftStartInsertChange}
          />
        </CustomRangeContainer>

        <FlexRow>
          <ControlLabel>Shift Ended</ControlLabel>
          <FlexRowEven>
            <FormControl
              name="shiftActive"
              defaultChecked={shiftEnded}
              componentClass="checkbox"
              onChange={toggleShiftActive}
            />
            <div>Ended</div>
          </FlexRowEven>
        </FlexRow>
        {shiftEnded && (
          <>
            <ControlLabel>Shift End</ControlLabel>

            <CustomRangeContainer>
              <DateControl
                value={shiftEndInsert}
                name="startDate"
                placeholder={'Starting date'}
                dateFormat={'YYYY-MM-DD'}
                timeFormat={'HH:mm'}
                onChange={onShiftEndInsertChange}
              />
            </CustomRangeContainer>
          </>
        )}

        <FlexCenter style={{ marginTop: '10px' }}>
          <Button btnStyle="primary" onClick={editTimeClock}>
            Save
          </Button>
        </FlexCenter>
      </FlexColumn>
    );
  };

  return <Form renderContent={renderTimelogForm} />;
};
