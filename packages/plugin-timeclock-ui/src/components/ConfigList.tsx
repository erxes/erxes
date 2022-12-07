import Button from '@erxes/ui/src/components/Button';
import { menuTimeClock } from '../menu';
import { router, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  CustomRangeContainer,
  FlexRow,
  FlexColumn,
  Input,
  FlexCenter,
  Row,
  FilterItem
} from '../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import { FormControl } from '@erxes/ui/src/components/form';
import { IAbsenceType } from '../types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import Table from '@erxes/ui/src/components/table';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';

import Form from '@erxes/ui/src/components/form/Form';
import ConfigForm from './ConfigForm';

type Props = {
  queryParams: any;
  history: any;
  absenceTypes?: IAbsenceType[];
  loading?: boolean;
  renderButton: (props: IButtonMutateProps) => void;
  removeAbsenceType: (absenceTypeId: string) => void;
};

function ConfigList(props: Props) {
  const { absenceTypes, removeAbsenceType } = props;
  const [selectedType, setType] = useState('');

  const renderSelectionBar = () => {
    const onTypeSelect = type => {
      localStorage.setItem('displayConfigType', JSON.stringify(type));
      const selType = JSON.parse(
        localStorage.getItem('displayConfigType') || '[]'
      ).value;
      setType(selType);
    };

    return (
      <FilterItem>
        <FormGroup>
          <ControlLabel>Select type</ControlLabel>
          <Row>
            <Select
              value={JSON.parse(
                localStorage.getItem('displayConfigType') || '[]'
              )}
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
      Absence
    </Button>
  );
  const scheduleConfigTrigger = (
    <Button id="configBtn" btnStyle="primary" icon="plus-circle">
      Schedule
    </Button>
  );
  const holidayConfigTrigger = (
    <Button id="configBtn" btnStyle="primary" icon="plus-circle">
      Holiday
    </Button>
  );

  const absenceConfigContent = absenceType => {
    return (
      <ConfigForm {...props} absenceType={absenceType} configType="Absence" />
    );
  };
  const scheduleConfigContent = absenceType => {
    return (
      <ConfigForm {...props} absenceType={absenceType} configType="Schedule" />
    );
  };
  const holidayConfigContent = absenceType => {
    return (
      <ConfigForm {...props} absenceType={absenceType} configType="Holiday" />
    );
  };

  const onRemoveAbsenceType = absenceTypeId => {
    removeAbsenceType(absenceTypeId);
  };

  const actionBarRight = (
    <>
      <ModalTrigger
        title={__('Absence Config')}
        trigger={absenceConfigTrigger}
        content={absenceConfigContent}
      />
      <ModalTrigger
        title={__('Schedule Config')}
        trigger={scheduleConfigTrigger}
        content={scheduleConfigContent}
      />
      <ModalTrigger
        title={__('Holiday Config')}
        trigger={holidayConfigTrigger}
        content={holidayConfigContent}
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

  const removeTrigger = absenceTypeId => (
    <Tip text={__('Delete')} placement="top">
      <Button
        btnStyle="link"
        onClick={() => onRemoveAbsenceType(absenceTypeId)}
        icon="times-circle"
      />
    </Tip>
  );

  const content = (
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
                    content={() => absenceConfigContent(absenceType)}
                  />
                  {removeTrigger(absenceType._id)}
                </td>
              </tr>
            );
          })}
      </tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Timeclocks')} submenu={menuTimeClock} />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
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
