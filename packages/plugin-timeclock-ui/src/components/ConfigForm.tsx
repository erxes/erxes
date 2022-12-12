import Button from '@erxes/ui/src/components/Button';
import { router, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  CustomRangeContainer,
  FlexRow,
  FlexColumn,
  Input,
  FlexCenter,
  Row
} from '../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IAbsenceType, IPayDates } from '../types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';

type Props = {
  queryParams: any;
  history: any;
  configType: string;
  absenceType?: IAbsenceType;
  payDate?: IPayDates;
  absenceTypes?: IAbsenceType[];
  loading?: boolean;
  afterSave?: () => void;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => void;
  removeAbsenceType: (absenceTypeId: string) => void;
  submitPayDatesConfig: (payDates: number[]) => void;
};

function ConfigForm(props: Props) {
  const {
    queryParams,
    history,
    absenceTypes,
    renderButton,
    removeAbsenceType,
    submitPayDatesConfig
  } = props;
  const { absenceType } = props;
  const [explanationRequired, setExplRequired] = useState(false);
  const [attachmentRequired, setAttachRequired] = useState(false);
  const [payPeriod, setPayPeriod] = useState('');
  const [displayConfig, setDisplayConfig] = useState(false);
  const [payDates, setpayDates] = useState({
    date1: new Date(),
    date2: new Date()
  });
  const { afterSave, closeModal } = props;

  const togglePayPeriod = e => {
    setPayPeriod(e.target.value);
  };
  const toggleExplRequired = e => {
    setExplRequired(e.target.checked);
  };
  const toggleAttachRequired = e => {
    setAttachRequired(e.target.checked);
  };

  const onSubmitPayDatesConfig = () => {
    payPeriod === 'twice'
      ? submitPayDatesConfig([
          payDates.date1.getDate(),
          payDates.date2.getDate()
        ])
      : submitPayDatesConfig([payDates.date1.getDate()]);
  };

  const onConfigDateChange = (dateNum: string, newDate: Date) => {
    payDates[dateNum] = newDate;
    setpayDates({ ...payDates });
  };
  const generateDoc = (values: {
    _id?: string;
    absenceName: string;
    explRequired: boolean;
    attachRequired: boolean;
  }) => {
    if (absenceType) {
      values._id = absenceType._id;
    }

    return {
      name: values.absenceName,
      explRequired: explanationRequired,
      attachRequired: attachmentRequired,
      _id: values._id
    };
  };

  const renderConfigContent = () => {
    const { configType } = props;
    switch (configType) {
      case 'Schedule':
        return <Form renderContent={renderScheduleContent} />;
      case 'Holiday':
        return <Form renderContent={renderHolidayContent} />;
      // Absence
      default:
        return <Form renderContent={renderAbsenceContent} />;
    }
  };

  const renderAbsenceContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <FlexColumn>
        <ControlLabel required={true}>Name</ControlLabel>
        <FormControl
          {...formProps}
          name="absenceName"
          defaultValue={absenceType && absenceType.name}
          required={true}
          autoFocus={true}
        />
        <FlexRow>
          <ControlLabel>Explanation Required</ControlLabel>
          <FormControl
            name="explRequired"
            componentClass="checkbox"
            defaultChecked={absenceType?.explRequired}
            onChange={toggleExplRequired}
          />
        </FlexRow>
        <FlexRow>
          <ControlLabel>Attachment Required</ControlLabel>
          <FormControl
            name="attachRequired"
            componentClass="checkbox"
            defaultChecked={absenceType?.attachRequired}
            onChange={toggleAttachRequired}
          />
        </FlexRow>
        <FlexCenter style={{ marginTop: '10px' }}>
          {renderButton({
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal || afterSave,
            object: absenceType || null
          })}
        </FlexCenter>
      </FlexColumn>
    );
  };

  const renderScheduleContent = () => (
    <FlexColumn>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <ControlLabel>Pay period</ControlLabel>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            gap: '10px'
          }}
        >
          <div>Once</div>
          <FormControl
            rows={2}
            name="payPeriod"
            componentClass="radio"
            options={['once', 'twice'].map(el => ({
              value: el
            }))}
            inline={true}
            onChange={togglePayPeriod}
          />
          <div>Twice</div>
        </div>
      </div>
      <CustomRangeContainer>
        {payPeriod === '' ? (
          <></>
        ) : (
          <>
            <DateControl
              value={payDates.date1}
              required={false}
              onChange={val => onConfigDateChange('date1', val)}
              placeholder={'Enter date'}
              dateFormat={'YYYY-MM-DD'}
            />
            {payPeriod === 'twice' ? (
              <DateControl
                value={payDates.date2}
                required={false}
                onChange={val => onConfigDateChange('date2', val)}
                placeholder={'Enter date'}
                dateFormat={'YYYY-MM-DD'}
              />
            ) : (
              <></>
            )}
          </>
        )}
      </CustomRangeContainer>
      <FlexCenter>
        <Button onClick={onSubmitPayDatesConfig} disabled={payPeriod === ''}>
          Submit
        </Button>
      </FlexCenter>
    </FlexColumn>
  );

  const renderHolidayContent = (formProps: IFormProps) => (
    <FlexColumn>
      <ControlLabel required={true}>Holiday Name</ControlLabel>
      <FormControl
        {...formProps}
        name="holidayName"
        defaultValue={absenceType && absenceType.name}
        required={true}
        autoFocus={true}
      />
      <CustomRangeContainer>
        <DateControl
          value={payDates.date1}
          required={false}
          onChange={val => onConfigDateChange('date1', val)}
          placeholder={'Enter date'}
          dateFormat={'YYYY-MM-DD'}
        />
      </CustomRangeContainer>
      <FlexCenter>
        <Button onClick={() => addHoliday()}>Add Holiday</Button>
        <Button>Submit</Button>
      </FlexCenter>
    </FlexColumn>
  );

  return renderConfigContent();
}

export default ConfigForm;
