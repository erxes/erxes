import Button from '@erxes/ui/src/components/Button';
import dayjs from 'dayjs';
import { menuTimeClock } from '../menu';
import { router, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import { Title } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { Input } from '@erxes/ui/src/components/form/styles';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import DateFilter from '@erxes/ui/src/components/DateFilter';
import { IAbsence } from '../types';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';

type Props = {
  absences: IAbsence[];
  queryParams: any;
  history: any;
  startTime?: Date;
  loading?: boolean;
  solveAbsence: (absenceId: string, status: string) => void;
  submitRequest: (explanation: string) => void;
};

const addDaysOfWeek = (today: Date): string[] => {
  let diffFromMon = today.getDay() - 1;
  const diffFromSun = 7 - today.getDay();
  const currWeek: string[] = [];

  while (diffFromMon !== 0) {
    currWeek.push(
      dayjs(today)
        .add(-diffFromMon, 'day')
        .toDate()
        .toDateString()
    );
    diffFromMon -= 1;
  }
  currWeek.push(today.toDateString());
  for (let i = 1; i <= diffFromSun; i++) {
    currWeek.push(
      dayjs(today)
        .add(i, 'day')
        .toDate()
        .toDateString()
    );
  }

  return currWeek;
};

function AbsenceList(props: Props) {
  const { queryParams, history, submitRequest, absences, solveAbsence } = props;
  const [explanation, setTextReason] = useState('');

  const trigger = (
    <Button id="timeClockButton2" btnStyle="success" icon="plus-circle">
      Create Request
    </Button>
  );
  const configTrigger = (
    <Button id="timeClockButton2" btnStyle="primary" icon="plus-circle">
      Absence Config
    </Button>
  );

  const configContent = () => (
    <FormGroup>
      <ControlLabel>Types of Absence requests</ControlLabel>
      {/* {mimeTypeDesc && <p>{__(mimeTypeDesc)}</p>} */}
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

  const modalContent = () => (
    <div style={{ flex: 'column', justifyContent: 'space-around' }}>
      <DateFilter queryParams={queryParams} history={history} />
      <SelectTeamMembers
        queryParams={queryParams}
        label={'Team member'}
        onSelect={onUserSelect}
        multi={false}
        name="userId"
      />
      <Select
        isRequired={true}
        placeholder={__('Reason')}
        onChange={onReasonSelect}
        value={router.getParam(history, 'reason') || ''}
        options={['Vacation', 'Sick Leave', 'Non paid absence'].map(ipt => ({
          value: ipt,
          label: __(ipt)
        }))}
      />
      <Input
        type="text"
        name="reason"
        placeholder="Please write short explanation"
        onChange={setInputValue}
      />
      <Button style={{ marginTop: 10 }} onClick={onSubmitClick}>
        {'Submit'}
      </Button>
    </div>
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
        trigger={trigger}
        content={modalContent}
      />
      <ModalTrigger
        title={__('Send absence request')}
        trigger={configTrigger}
        content={configContent}
      />
    </>
  );

  const thisWeek = addDaysOfWeek(new Date());
  const startOfWeek = thisWeek[0]
    .split(' ')
    .slice(1, 3)
    .join(' ');
  const title = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginRight: '20px',
        fontSize: '24px'
      }}
    >
      <Title>{__(`Week of ${startOfWeek}`)}</Title>
    </div>
  );

  const actionBar = (
    <Wrapper.ActionBar
      left={title}
      right={actionBarRight}
      hasFlex={true}
      wideSpacing={true}
    />
  );

  const ListAbsenceContent = absence => {
    const startTime = new Date(absence.startTime);
    const endTime = new Date(absence.endTime);
    const startingDate = startTime.toDateString();
    const startingTime = startTime.toLocaleTimeString();
    const endingDate = endTime.toDateString();
    const endingTime = endTime.toLocaleTimeString();

    return (
      <tr>
        <td>{<NameCard user={absence.user} /> || '-'}</td>
        <td>{startingTime + ', ' + startingDate || '-'}</td>
        <td>{endingTime + ', ' + endingDate || '-'}</td>
        <td>{absence.reason || '-'}</td>
        <td>{absence.explanation || '-'}</td>
        <td>
          {absence.solved ? (
            __(absence.status)
          ) : (
            <>
              <Button
                btnStyle="success"
                onClick={() => solveAbsence(absence._id, 'Approved')}
              >
                Approve
              </Button>
              <Button
                btnStyle="danger"
                onClick={() => solveAbsence(absence._id, 'Rejected')}
              >
                Reject
              </Button>
            </>
          )}
        </td>
      </tr>
    );
  };

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Team member')}</th>
          <th>{__('From')}</th>
          <th>{__('To')}</th>
          <th>{__('Reason')}</th>
          <th>{__('Explanation')}</th>
          <th>{__('Status')}</th>
        </tr>
      </thead>
      <tbody>
        {absences.map(absence => {
          return ListAbsenceContent(absence);
        })}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(() =>
    import(
      /* webpackChunkName: "List - Timeclocks" */ '../containers/SideBarList'
    )
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
      leftSidebar={
        <SideBarList
          onUserSelect={onUserSelect}
          queryParams={queryParams}
          history={history}
        />
      }
    />
  );
}

export default AbsenceList;
