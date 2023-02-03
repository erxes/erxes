import Button from '@erxes/ui/src/components/Button';
import { Alert, router, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import { FormControl } from '@erxes/ui/src/components/form';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { IAbsenceType } from '../../types';
import Uploader from '@erxes/ui/src/components/Uploader';
import { FlexCenter } from '../../styles';
import { IAttachment } from '@erxes/ui/src/types';
import DateRange from '../datepicker/DateRange';

type Props = {
  absenceTypes: IAbsenceType[];
  history: any;
  queryParams: any;
  submitRequest: (
    userId: string,
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
  const [dateRange, setDateRange] = useState<DateTimeRange>({
    startTime: new Date(localStorage.getItem('dateRangeStart') || ''),
    endTime: new Date(localStorage.getItem('dateRangeEnd') || '')
  });
  const {
    absenceTypes,
    queryParams,
    submitRequest,
    contentProps,
    history
  } = props;
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
  const onSubmitClick = closeModal => {
    const validInput = checkInput(userId);
    if (validInput) {
      submitRequest(
        userId,
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
    router.setParams(history, { reason: `${reason.value}` });
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

  const onSaveDateRange = () => {
    localStorage.setItem('dateRangeStart', dateRange.startTime.toISOString());
    localStorage.setItem('dateRangeEnd', dateRange.endTime.toISOString());
    Alert.success('succesfully saved');
  };

  return (
    <div style={{ flex: 'column', justifyContent: 'space-around' }}>
      <DateRange
        startDate={dateRange.startTime}
        endDate={dateRange.endTime}
        onChangeEnd={onDateRangeEndChange}
        onChangeStart={onDateRangeStartChange}
        onSaveButton={onSaveDateRange}
      />

      <SelectTeamMembers
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
        <Button
          style={{ marginTop: 10 }}
          onClick={() => onSubmitClick(contentProps.closeModal)}
        >
          {'Submit'}
        </Button>
      </FlexCenter>
    </div>
  );
};
