import Button from '@erxes/ui/src/components/Button';
import { menuTimeClock } from '../menu';
import { router, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { FormControl } from '@erxes/ui/src/components/form';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import DateFilter from '@erxes/ui/src/components/DateFilter';
import { IAbsence, IAbsenceType } from '../types';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import Uploader from '@erxes/ui/src/components/Uploader';
import { FlexCenter } from '../styles';
import { IAttachment } from '@erxes/ui/src/types';
import SideBarList from '../containers/SideBarList';

type Props = {
  absences: IAbsence[];
  absenceTypes: IAbsenceType[];
  queryParams: any;
  history: any;
  startTime?: Date;
  loading?: boolean;
  solveAbsence: (absenceId: string, status: string) => void;
  submitRequest: (explanation: string, attachment: IAttachment) => void;
};

function AbsenceList(props: Props) {
  const {
    queryParams,
    history,
    submitRequest,
    absences,
    absenceTypes,
    solveAbsence
  } = props;
  const [explanation, setTextReason] = useState('');
  const [attachment, setAttachment] = useState<IAttachment>({
    name: ' ',
    type: '',
    url: ''
  });
  const [absenceIdx, setArrayIdx] = useState(0);

  const trigger = (
    <Button id="timeClockButton2" btnStyle="success" icon="plus-circle">
      Create Request
    </Button>
  );
  const onChangeAttachment = (files: IAttachment[]) => {
    setAttachment(files[0]);
  };

  const modalContent = ({ closeModal }) => {
    return (
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
          placeholder={__('Reason')}
          onChange={onReasonSelect}
          value={router.getParam(history, 'reason') || ''}
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
            onClick={() => onSubmitClick(closeModal)}
          >
            {'Submit'}
          </Button>
        </FlexCenter>
      </div>
    );
  };

  const onSubmitClick = closeModal => {
    submitRequest(explanation, attachment);
    closeModal();
  };

  const setInputValue = e => {
    setTextReason(e.target.value);
  };

  const onUserSelect = userId => {
    router.setParams(history, { userId: `${userId}` });
  };
  const onReasonSelect = reason => {
    setArrayIdx(reason.arrayIdx);
    router.setParams(history, { reason: `${reason.value}` });
  };

  const actionBarRight = (
    <ModalTrigger
      title={__('Absence Config')}
      trigger={trigger}
      content={modalContent}
    />
  );

  const actionBar = (
    <Wrapper.ActionBar
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
      leftSidebar={<SideBarList queryParams={queryParams} history={history} />}
    />
  );
}

export default AbsenceList;
