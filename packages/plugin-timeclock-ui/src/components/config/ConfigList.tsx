import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Row, FilterItem, TextAlignCenter } from '../../styles';
import {
  IAbsence,
  IAbsenceType,
  IPayDates,
  IScheduleConfig
} from '../../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Table from '@erxes/ui/src/components/table';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';

import ConfigForm from './ConfigForm';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';

type Props = {
  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
  getPagination: (pagination: any) => void;

  absenceTypes?: IAbsenceType[];

  holidays?: IAbsence[];

  payDates: IPayDates[];

  scheduleConfigs?: IScheduleConfig[];

  deviceConfigsTotalCount?: number;

  loading?: boolean;
  renderButton: (props: IButtonMutateProps) => void;
  removeAbsenceType: (absenceTypeId: string) => void;
  removeHoliday: (holidayId: string) => void;
  removePayDate: (payDateId: string) => void;
  removeScheduleConfig: (scheduleConfigId: string) => void;
  removeDeviceConfig: (deviceConfig: string) => void;
};

function ConfigList(props: Props) {
  const {
    absenceTypes,
    payDates,
    holidays,
    scheduleConfigs,
    deviceConfigsTotalCount,
    removeAbsenceType,
    removeHoliday,
    removePayDate,
    getActionBar,
    removeScheduleConfig,
    removeDeviceConfig,
    showSideBar,
    getPagination
  } = props;

  const [selectedType, setType] = useState(
    localStorage.getItem('contentType') || 'Schedule Configs'
  );

  const renderSelectionBar = () => {
    const onTypeSelect = type => {
      setType(type.value);
      localStorage.setItem('contentType', type.value);
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
              options={[
                'Schedule Configs',
                'Absence types',
                'Pay period',
                'Holidays'
              ].map(ipt => ({
                value: ipt,
                label: __(ipt)
              }))}
            />
          </Row>
        </FormGroup>
      </FilterItem>
    );
  };

  const scheduleConfigTrigger = (
    <Button id="scheduleBtn" btnStyle="primary" icon="plus-circle">
      Schedule
    </Button>
  );

  const absenceConfigTrigger = (
    <Button id="configBtn" btnStyle="primary" icon="plus-circle">
      Requests
    </Button>
  );
  const payPeriodConfigTrigger = (
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

  const scheduleConfigContent = ({ closeModal }, scheduleConfig) => {
    return (
      <ConfigForm
        {...props}
        scheduleConfig={scheduleConfig}
        configType="Schedule"
        closeModal={closeModal}
      />
    );
  };

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

  const payPeriodConfigContent = ({ closeModal }, payDate) => {
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
        size="lg"
        title={__('Schedule Config')}
        trigger={scheduleConfigTrigger}
        content={contentProps => scheduleConfigContent(contentProps, null)}
      />
      <ModalTrigger
        title={__('Requests Config')}
        trigger={absenceConfigTrigger}
        content={contentProps => absenceConfigContent(contentProps, null)}
      />
      <ModalTrigger
        title={__('Schedule Config')}
        trigger={payPeriodConfigTrigger}
        content={contentProps => payPeriodConfigContent(contentProps, null)}
      />
      <ModalTrigger
        title={__('Holiday Config')}
        trigger={holidayConfigTrigger}
        content={contentProps => holidayConfigContent(contentProps, null)}
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

  const getRemoveFunction = configType => {
    switch (configType) {
      case 'absenceType':
        return removeAbsenceType;
      case 'holiday':
        return removeHoliday;
      case 'payDate':
        return removePayDate;
      case 'deviceConfig':
        return removeDeviceConfig;
      default:
        return removeScheduleConfig;
    }
  };
  const removeTrigger = (_id, configType) => {
    const remove = getRemoveFunction(configType);
    return (
      <Tip text={__('Delete')} placement="top">
        <Button
          btnStyle="link"
          onClick={() => remove(_id)}
          icon="times-circle"
        />
      </Tip>
    );
  };

  const content = () => {
    switch (selectedType) {
      case 'Holidays':
        return renderHolidaysContent();
      case 'Pay period':
        return renderpayPeriodConfigContent();
      case 'Schedule Configs':
        return renderScheduleConfigContent();
      default:
        return renderAbsenceTypesContent();
    }
  };

  const renderScheduleConfigContent = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>Schedule Name</th>
            <th>Check in</th>
            <th>Check out</th>
            <th>Lunch break</th>
            <th>Valid check in</th>
            <th>Valid check out</th>
            <th>Overtime shift</th>
            <th>
              <TextAlignCenter>Action</TextAlignCenter>
            </th>
          </tr>
        </thead>
        <tbody>
          {scheduleConfigs &&
            scheduleConfigs.map(scheduleConfig => {
              return (
                <tr key={scheduleConfig.scheduleName}>
                  <td>{scheduleConfig.scheduleName}</td>
                  <td>{scheduleConfig.shiftStart}</td>
                  <td>{scheduleConfig.shiftEnd}</td>
                  <td>{scheduleConfig.lunchBreakInMins}</td>
                  {scheduleConfig.configDays.map(configDay => {
                    if (
                      configDay.configName?.toLocaleLowerCase() ===
                      'validcheckin'
                    ) {
                      return (
                        <td>
                          {configDay.configShiftStart +
                            '\t~\t' +
                            configDay.configShiftEnd}
                        </td>
                      );
                    }
                  })}
                  {scheduleConfig.configDays.map(configDay => {
                    if (
                      configDay.configName?.toLocaleLowerCase() ===
                      'validcheckout'
                    ) {
                      return (
                        <td>
                          {configDay.configShiftStart +
                            '\t~\t' +
                            configDay.configShiftEnd}
                        </td>
                      );
                    }
                  })}
                  {scheduleConfig.configDays.map(configDay => {
                    if (
                      configDay.configName?.toLocaleLowerCase() === 'overtime'
                    ) {
                      return (
                        <td>
                          {configDay.configShiftStart +
                            '\t~\t' +
                            configDay.configShiftEnd}
                        </td>
                      );
                    }
                  })}
                  <td>
                    <TextAlignCenter>
                      <ModalTrigger
                        size="lg"
                        title="Edit Schedule Configs"
                        trigger={editTrigger}
                        content={contentProps =>
                          scheduleConfigContent(contentProps, scheduleConfig)
                        }
                      />
                      {removeTrigger(scheduleConfig._id, 'schedule')}
                    </TextAlignCenter>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    );
  };

  const renderpayPeriodConfigContent = () => {
    return (
      <Table>
        <thead>
          <th>Pay date occurrence</th>
          <th colSpan={2}>Dates</th>
          <th>
            <TextAlignCenter>Action</TextAlignCenter>
          </th>
        </thead>
        <tbody>
          {payDates.length > 0 && (
            <>
              <td>{payDates[0].payDates.length}</td>
              <td>{payDates[0].payDates[0]}</td>
              <td>{payDates[0].payDates[1]}</td>
              <td>
                <TextAlignCenter>
                  <ModalTrigger
                    title="Edit Pay Dates"
                    trigger={editTrigger}
                    content={contentProps =>
                      payPeriodConfigContent(contentProps, payDates[0])
                    }
                  />
                  {removeTrigger(payDates[0]._id, 'payDate')}
                </TextAlignCenter>
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
            <th>Request type</th>
            <th>Request time</th>
            <th>Time period</th>
            <th>Explanation required</th>
            <th>Attachment required</th>
            <th>
              <TextAlignCenter>Action</TextAlignCenter>
            </th>
          </tr>
        </thead>
        <tbody>
          {absenceTypes &&
            absenceTypes.map(absenceType => {
              return (
                <tr key={absenceType._id}>
                  <td>{absenceType.name}</td>
                  <td>{absenceType.requestType}</td>
                  <td>{absenceType.requestTimeType}</td>
                  <td>
                    {absenceType.requestTimeType === 'by day'
                      ? `${absenceType.requestHoursPerDay} hours`
                      : ''}
                  </td>
                  <td>{absenceType.explRequired ? 'true' : 'false'}</td>
                  <td>{absenceType.attachRequired ? 'true' : 'false'}</td>
                  <td>
                    <TextAlignCenter>
                      <ModalTrigger
                        title="Edit absence type"
                        trigger={editTrigger}
                        content={contentProps =>
                          absenceConfigContent(contentProps, absenceType)
                        }
                      />
                      {removeTrigger(absenceType._id, 'absenceType')}
                    </TextAlignCenter>
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
            <th>
              <TextAlignCenter>Action</TextAlignCenter>
            </th>
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
                    <TextAlignCenter>
                      <ModalTrigger
                        title="Edit holiday"
                        trigger={editTrigger}
                        content={contentProps =>
                          holidayConfigContent(contentProps, holiday)
                        }
                      />
                      {removeTrigger(holiday._id, 'holiday')}
                    </TextAlignCenter>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    );
  };

  showSideBar(false);
  getActionBar(actionBar);
  getPagination(<Pagination count={deviceConfigsTotalCount} />);

  return content();
}

export default ConfigList;
