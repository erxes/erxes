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
import { CustomRangeContainer } from '../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';

type Props = {
  queryParams: any;
  history: any;
  startTime?: Date;
  loading?: boolean;
  solveAbsence: (absenceId: string, status: string) => void;
  submitRequest: (explanation: string) => void;
};

function ConfigList(props: Props) {
  const { queryParams, history, submitRequest } = props;
  const [explanation, setTextReason] = useState('');

  const absenceConfigTrigger = (
    <Button id="configBtn" btnStyle="primary" icon="plus-circle">
      Schedule Config
    </Button>
  );
  const scheduleConfigTrigger = (
    <Button id="configBtn" btnStyle="primary" icon="plus-circle">
      Absence Config
    </Button>
  );

  const absenceConfigContent = () => (
    <FormGroup>
      <ControlLabel>Types of Absence requests</ControlLabel>
      <Select
        // value={configsMap.UPLOAD_FILE_TYPES}
        // options={mimeTypeOptions}
        // onChange={this.onChangeMultiCombo.bind(this, 'UPLOAD_FILE_TYPES')}
        multi={true}
        delimiter=","
        simpleValue={true}
      />
    </FormGroup>
  );

  const scheduleConfigContent = () => (
    <CustomRangeContainer>
      <DateControl
        // value={new Date()}
        required={false}
        name="startDate"
        // onChange={onSelectDateChange}
        placeholder={'Starting date'}
        dateFormat={'YYYY-MM-DD'}
      />
      <DateControl
        // value={new Date()}
        required={false}
        name="startDate"
        // onChange={onSelectDateChange}
        placeholder={'Ending date'}
        dateFormat={'YYYY-MM-DD'}
      />
      <Button btnStyle="success">Save</Button>
    </CustomRangeContainer>
  );

  const onSubmitClick = () => {
    submitRequest(explanation);
  };

  const setInputValue = e => {
    const expl = e.target.value;
    setTextReason(expl);
  };

  const onUserSelect = userId => {
    router.setParams(history, { userId: `${userId}` });
  };
  const onReasonSelect = reason => {
    router.setParams(history, { reason: `${reason.value}` });
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

  const content = <div>asdasd</div>;

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
