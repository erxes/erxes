import Button from '@erxes/ui/src/components/Button';
import { Alert, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import { FormControl } from '@erxes/ui/src/components/form';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { IAbsenceType } from '../../types';
import Uploader from '@erxes/ui/src/components/Uploader';
import { CustomRangeContainer, FlexCenter, FlexColumn } from '../../styles';
import { IAttachment } from '@erxes/ui/src/types';
import DateRange from '../datepicker/DateRange';
import DateControl from '@erxes/ui/src/components/form/DateControl';

type Props = {
  absenceTypes: IAbsenceType[];
  history: any;
  queryParams: any;

  submitCheckInOut: (type: string, userId: string, dateVal: Date) => void;
  checkInOutRequest?: boolean;

  submitRequest: (
    userId: string,
    reason: string,
    explanation: string,
    attachment: IAttachment,
    dateRange: DateTimeRange,
    absenceTypeId: string
  ) => void;
  contentProps: any;
};

type DateTimeRange = {
  startTime: Date;
  endTime: Date;
};

export default (props: Props) => {
  const {
    absenceTypes,
    queryParams,
    submitRequest,
    contentProps,
    checkInOutRequest,
    submitCheckInOut
  } = props;

  const { closeModal } = contentProps;

  const [dateRange, setDateRange] = useState<DateTimeRange>({
    startTime: new Date(localStorage.getItem('dateRangeStart') || ''),
    endTime: new Date(localStorage.getItem('dateRangeEnd') || '')
  });

  const [checkInOutType, setCheckInOutType] = useState('Check in');
  const [checkInOutDate, setCheckInOutDate] = useState(new Date());

  const [explanation, setExplanation] = useState('');
  const [attachment, setAttachment] = useState<IAttachment>({
    name: ' ',
    type: '',
    url: ''
  });

  const checkAbsenceIdx = parseInt(
    localStorage.getItem('absenceIdx') || '0',
    10
  );

  const [absenceIdx, setAbsenceArrIdx] = useState(
    checkAbsenceIdx < absenceTypes.length ? checkAbsenceIdx : 0
  );

  const [userId, setUserId] = useState('');

  const checkInput = selectedUser => {
    if (selectedUser === '') {
      Alert.error('No user was selected');
    } else if (
      absenceTypes[absenceIdx].attachRequired &&
      attachment.url === ''
    ) {
      Alert.error('No attachment was uploaded');
    } else if (absenceTypes[absenceIdx].explRequired && explanation === '') {
      Alert.error('No explanation was given');
    } else {
      return true;
    }
  };
  const onSubmitClick = () => {
    const validInput = checkInput(userId);
    if (validInput) {
      submitRequest(
        userId,
        absenceTypes[absenceIdx].name,
        explanation,
        attachment,
        dateRange,
        absenceTypes[absenceIdx]._id
      );
      closeModal();
    }
  };

  const setInputValue = e => {
    setExplanation(e.target.value);
  };

  const onUserSelect = usrId => {
    setUserId(usrId);
  };

  const onReasonSelect = reason => {
    setAbsenceArrIdx(reason.arrayIdx);
  };

  const onChangeAttachment = (files: IAttachment[]) => {
    setAttachment(files[0]);
  };

  const onDateRangeStartChange = (newStart: Date) => {
    const newRange = dateRange;
    newRange.startTime = newStart;
    setDateRange({ ...newRange });
  };

  const onDateRangeEndChange = (newEnd: Date) => {
    const newRange = dateRange;
    newRange.endTime = newEnd;
    setDateRange({ ...newRange });
  };

  const onCheckInDateChange = date => {
    setCheckInOutDate(date);
  };

  const onSaveDateRange = () => {
    localStorage.setItem('dateRangeEnd', dateRange.endTime.toISOString());
    localStorage.setItem('dateRangeStart', dateRange.startTime.toISOString());
    Alert.success('succesfully saved');
  };

  const onSubmitCheckInOut = () => {
    submitCheckInOut(checkInOutType, userId, checkInOutDate);
    closeModal();
  };

  if (checkInOutRequest) {
    return (
      <FlexColumn marginNum={10}>
        <Select
          value={checkInOutType}
          onChange={e => setCheckInOutType(e.value)}
          options={['Check in', 'Check out'].map(ipt => ({
            label: ipt,
            value: ipt
          }))}
        />

        <SelectTeamMembers
          queryParams={queryParams}
          customField="employeeId"
          label={'Team member'}
          onSelect={onUserSelect}
          multi={false}
          name="userId"
        />

        <CustomRangeContainer>
          <DateControl
            required={false}
            value={checkInOutDate}
            name="startDate"
            placeholder={'Starting date'}
            dateFormat="YYYY-MM-DD"
            timeFormat="HH:mm"
            onChange={val => onCheckInDateChange(val)}
          />
        </CustomRangeContainer>

        <FlexCenter>
          <Button btnStyle="primary" onClick={onSubmitCheckInOut}>
            Submit
          </Button>
        </FlexCenter>
      </FlexColumn>
    );
  }

  return (
    <FlexColumn marginNum={10}>
      <DateRange
        showTime={absenceTypes[absenceIdx].requestTimeType === 'by hour'}
        startDate={dateRange.startTime}
        endDate={dateRange.endTime}
        onChangeEnd={onDateRangeEndChange}
        onChangeStart={onDateRangeStartChange}
        onSaveButton={onSaveDateRange}
      />

      <SelectTeamMembers
        customField="employeeId"
        queryParams={queryParams}
        label={'Team member'}
        onSelect={onUserSelect}
        multi={false}
        name="userId"
      />

      <Select
        placeholder={__('Reason')}
        onChange={onReasonSelect}
        value={absenceTypes.length > 0 && absenceTypes[absenceIdx].name}
        options={
          absenceTypes &&
          absenceTypes.map((absenceType, idx) => ({
            value: absenceType.name,
            label: absenceType.name,
            arrayIdx: idx
          }))
        }
      />
      {absenceTypes.length > 0 && absenceTypes[absenceIdx].explRequired ? (
        <FormControl
          type="text"
          name="reason"
          placeholder="Please write short explanation"
          onChange={setInputValue}
          required={true}
        />
      ) : (
        <></>
      )}

      {absenceTypes.length > 0 && absenceTypes[absenceIdx].attachRequired ? (
        <Uploader
          text={`Choose a file to upload`}
          warningText={'Only .jpg or jpeg file is supported.'}
          single={true}
          defaultFileList={[]}
          onChange={onChangeAttachment}
        />
      ) : (
        <></>
      )}
      <FlexCenter>
        <Button style={{ marginTop: 10 }} onClick={onSubmitClick}>
          {'Submit'}
        </Button>
      </FlexCenter>
    </FlexColumn>
  );
};
