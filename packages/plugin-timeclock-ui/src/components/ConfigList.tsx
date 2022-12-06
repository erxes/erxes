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
  FlexCenter
} from '../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import { FormControl } from '@erxes/ui/src/components/form';
import { IAbsenceType } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Table from '@erxes/ui/src/components/table';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';

type Props = {
  queryParams: any;
  history: any;
  absenceTypes?: IAbsenceType[];
  loading?: boolean;
  submitAbsenceConfig: (props: IButtonMutateProps) => void;
  removeAbsenceType: (absenceTypeId: string) => void;
};

function ConfigList(props: Props) {
  const {
    queryParams,
    history,
    absenceTypes,
    submitAbsenceConfig,
    removeAbsenceType
  } = props;

  const [absenceName, setAbsenceName] = useState('');
  const [explRequired, setExplRequired] = useState(false);
  const [attachRequired, setAttachRequired] = useState(false);
  const [displayConfig, setDisplayConfig] = useState(false);
  const [configDates, setConfigDates] = useState({
    date1: new Date(),
    date2: new Date()
  });

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

  const onConfigDateChange = (dateNum: string, newDate: Date) => {
    configDates[dateNum] = newDate;
    setConfigDates({ ...configDates });
  };

  const absenceConfigContent = absenceType => (
    <FlexColumn>
      <div>
        <ControlLabel>Name for an absence request</ControlLabel>
        <Input
          value={absenceType && absenceType.name}
          type="text"
          required={true}
          onChange={event => {
            event.preventDefault();
            setAbsenceName(event.target.value);
          }}
        />
      </div>
      <FlexRow>
        <ControlLabel>Explanation Required</ControlLabel>
        <FormControl
          componentClass="checkbox"
          onChange={() => setExplRequired(!explRequired)}
          checked={absenceType ? absenceType.explRequired : explRequired}
        />
      </FlexRow>
      <FlexRow>
        <ControlLabel>Attachment Required</ControlLabel>
        <FormControl
          componentClass="checkbox"
          onChange={() => setAttachRequired(!attachRequired)}
          checked={absenceType ? absenceType.attachRequired : attachRequired}
        />
      </FlexRow>
      <FlexCenter style={{ marginTop: '10px' }}>
        <Button onClick={onSubmitAbsenceConfig}>Submit</Button>
      </FlexCenter>
    </FlexColumn>
  );

  const scheduleConfigContent = () => (
    <FlexColumn>
      <CustomRangeContainer>
        <DateControl
          value={configDates.date1}
          required={false}
          onChange={val => onConfigDateChange('date1', val)}
          placeholder={'Enter date'}
          dateFormat={'YYYY-MM-DD'}
        />
        {displayConfig ? (
          <DateControl
            value={configDates.date2}
            required={false}
            onChange={val => onConfigDateChange('date2', val)}
            placeholder={'Enter date'}
            dateFormat={'YYYY-MM-DD'}
          />
        ) : (
          <></>
        )}
      </CustomRangeContainer>
      <FlexCenter>
        <Button onClick={() => setDisplayConfig(!displayConfig)}>
          {(displayConfig ? 'Remove' : 'Add') + ' date'}
        </Button>
        <Button>Submit</Button>
      </FlexCenter>
    </FlexColumn>
  );

  const onSubmitAbsenceConfig = () => {
    submitAbsenceConfig({
      values: {
        name: absenceName,
        explRequired: `${explRequired}`,
        attachRequired: `${attachRequired}`
      },
      isSubmitted: false
    });
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
    </>
  );

  const actionBar = (
    <Wrapper.ActionBar
      right={actionBarRight}
      hasFlex={true}
      wideSpacing={true}
    />
  );
  const editTrigger = (
    <Tip text={__('Edit')} placement="top">
      <Button btnStyle="link">
        <Icon icon="edit-3" />
      </Button>
    </Tip>
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
      <tr>
        <th>Absence type</th>
        <th>Explanation required</th>
        <th>Attachment required</th>
        <th>Action</th>
      </tr>
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
