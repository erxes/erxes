import Button from '@erxes/ui/src/components/Button';
import { menuTimeClock } from '../../menu';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Row, FilterItem } from '../../styles';
import { IAbsence, IAbsenceType, IPayDates } from '../../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Table from '@erxes/ui/src/components/table';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';

import ConfigForm from './ConfigForm';

type Props = {
  absenceTypes?: IAbsenceType[];
  holidays?: IAbsence[];
  payDates: IPayDates[];
  loading?: boolean;
  renderButton: (props: IButtonMutateProps) => void;
  removeAbsenceType: (absenceTypeId: string) => void;
  removeHoliday: (holidayId: string) => void;
  removePayDate: (payDateId: string) => void;
  submitPayDatesConfig: (payDates: number[]) => void;
};

function ConfigList(props: Props) {
  const {
    absenceTypes,
    payDates,
    holidays,
    removeAbsenceType,
    removeHoliday,
    removePayDate
  } = props;
  const [selectedType, setType] = useState('Absence types');

  const renderSelectionBar = () => {
    const onTypeSelect = type => {
      setType(type.value);
    };

    return (
      <FilterItem>
        <FormGroup>
          <ControlLabel>Select type</ControlLabel>
          <Row>
            <Select
              value={selectedType}
              onChange={onTypeSelect}
              placeholder="Select type"
              multi={false}
              options={['Absence types', 'Pay period', 'Holidays'].map(ipt => ({
                value: ipt,
                label: __(ipt)
              }))}
            />
          </Row>
        </FormGroup>
      </FilterItem>
    );
  };

  const absenceConfigTrigger = (
    <Button id="configBtn" btnStyle="primary" icon="plus-circle">
      Requests
    </Button>
  );
  const scheduleConfigTrigger = (
    <Button
      id="configBtn"
      btnStyle="primary"
      icon="plus-circle"
      disabled={payDates.length > 0}
    >
      Pay period
    </Button>
  );
  const holidayConfigTrigger = (
    <Button id="configBtn" btnStyle="primary" icon="plus-circle">
      Holiday
    </Button>
  );

  const absenceConfigContent = ({ closeModal }, absenceType) => {
    return (
      <ConfigForm
        {...props}
        absenceType={absenceType}
        configType="Absence"
        closeModal={closeModal}
      />
    );
  };

  const payDateContent = ({ closeModal }, payDate) => {
    return (
      <ConfigForm
        {...props}
        closeModal={closeModal}
        payDate={payDate}
        configType="PayDate"
      />
    );
  };

  const holidayConfigContent = ({ closeModal }, holiday) => {
    return (
      <ConfigForm
        {...props}
        closeModal={closeModal}
        holiday={holiday}
        configType="Holiday"
      />
    );
  };

  const actionBarRight = (
    <>
      <ModalTrigger
        title={__('Requests Config')}
        trigger={absenceConfigTrigger}
        content={contenProps => absenceConfigContent(contenProps, null)}
      />
      <ModalTrigger
        title={__('Schedule Config')}
        trigger={scheduleConfigTrigger}
        content={contenProps => payDateContent(contenProps, null)}
      />
      <ModalTrigger
        title={__('Holiday Config')}
        trigger={holidayConfigTrigger}
        content={contenProps => holidayConfigContent(contenProps, null)}
      />
    </>
  );

  const actionBar = (
    <Wrapper.ActionBar
      right={actionBarRight}
      left={renderSelectionBar()}
      hasFlex={true}
      wideSpacing={true}
    />
  );
  const editTrigger = (
    <Button btnStyle="link">
      <Icon icon="edit-3" />
    </Button>
  );

  const removeTrigger = (_id, configType) => {
    switch (configType) {
      case 'absenceType':
        return (
          <Tip text={__('Delete')} placement="top">
            <Button
              btnStyle="link"
              onClick={() => removeAbsenceType(_id)}
              icon="times-circle"
            />
          </Tip>
        );
      case 'holiday':
        return (
          <Tip text={__('Delete')} placement="top">
            <Button
              btnStyle="link"
              onClick={() => removeHoliday(_id)}
              icon="times-circle"
            />
          </Tip>
        );
      case 'payDate':
        return (
          <Tip text={__('Delete')} placement="top">
            <Button
              btnStyle="link"
              onClick={() => removePayDate(_id)}
              icon="times-circle"
            />
          </Tip>
        );
    }
  };

  const content = () => {
    switch (selectedType) {
      case 'Holidays':
        return renderHolidaysContent();
      case 'Pay period':
        return renderpayDateContent();
      default:
        return renderAbsenceTypesContent();
    }
  };

  const renderpayDateContent = () => {
    return (
      <Table>
        <thead>
          <th>Pay date occurrence</th>
          <th colSpan={2}>Dates</th>
          <th>Action</th>
        </thead>
        <tbody>
          {payDates.length > 0 && (
            <>
              <td>{payDates[0].payDates.length}</td>
              <td>{payDates[0].payDates[0]}</td>
              <td>{payDates[0].payDates[1]}</td>
              <td>
                <ModalTrigger
                  title="Edit Pay Dates"
                  trigger={editTrigger}
                  content={contenProps =>
                    payDateContent(contenProps, payDates[0])
                  }
                />
                {removeTrigger(payDates[0]._id, 'payDate')}
              </td>
            </>
          )}
        </tbody>
      </Table>
    );
  };
  const renderAbsenceTypesContent = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>Absence type</th>
            <th>Explanation required</th>
            <th>Attachment required</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {absenceTypes &&
            absenceTypes.map(absenceType => {
              return (
                <tr key={absenceType._id}>
                  <td>{absenceType.name}</td>
                  <td>{absenceType.explRequired ? 'true' : 'false'}</td>
                  <td>{absenceType.attachRequired ? 'true' : 'false'}</td>
                  <td>
                    <ModalTrigger
                      title="Edit absence type"
                      trigger={editTrigger}
                      content={contentProps =>
                        absenceConfigContent(contentProps, absenceType)
                      }
                    />
                    {removeTrigger(absenceType._id, 'absenceType')}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    );
  };

  const renderHolidaysContent = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>Holiday Name</th>
            <th>Starting date</th>
            <th>Ending date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {holidays &&
            holidays.map(holiday => {
              return (
                <tr key={holiday._id}>
                  <td>{holiday.holidayName}</td>
                  <td>
                    {(holiday.startTime &&
                      new Date(holiday.startTime)
                        .toDateString()
                        .split(' ')
                        .slice(0, 3)
                        .join(' ')) ||
                      '-'}
                  </td>
                  <td>
                    {(holiday.endTime &&
                      new Date(holiday.endTime)
                        .toDateString()
                        .split(' ')
                        .slice(0, 3)
                        .join(' ')) ||
                      '-'}
                  </td>
                  <td>
                    <ModalTrigger
                      title="Edit holiday"
                      trigger={editTrigger}
                      content={contentProps =>
                        holidayConfigContent(contentProps, holiday)
                      }
                    />
                    {removeTrigger(holiday._id, 'holiday')}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Timeclocks')} submenu={menuTimeClock} />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content()}
          loading={false}
          emptyText={__('Theres no timeclock')}
          emptyImage="/images/actions/8.svg"
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
}

export default ConfigList;
