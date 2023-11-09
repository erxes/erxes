import { Button, FormControl, Icon } from '@erxes/ui/src/components';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import PageContent from '@erxes/ui/src/layout/components/PageContent';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems, FlexContent } from '@erxes/ui/src/layout/styles';
import { __, confirm } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import {
  ActionBarButtonsWrapper,
  BackButton,
  CenterBar,
  DragField,
  FlexCenter,
  Title
} from '../../styles';
import { IChart, IReport, IReportItem } from '../../types';
import Chart from '../chart/Chart';
import SelectMembersForm from '../utils/SelectMembersForm';
import Participators from './Participators';

const deserializeItem = i => ({
  ...i,
  layout: JSON.parse(i.layout) || {},
  vizState: JSON.parse(i.vizState)
});

const defaultLayout = i => ({
  x: i.layout.x || 0,
  y: i.layout.y || 0,
  w: i.layout.w || 3,
  h: i.layout.h || 3,
  minW: 1,
  minH: 1
});

type Props = {
  report: IReport;
  reportItems: IReportItem[];
  history: any;
  queryParams: any;
  reportsEdit: (reportId: string, values: any, callback?: any) => void;
};

const Report = (props: Props) => {
  const { report, reportsEdit, history } = props;
  const { charts, members } = report;
  const [isPublic, setIsPublic] = useState(report.visibility === 'public');
  const [name, setName] = useState(report.name || '');
  const [visibility, setVisibility] = useState<string>(report.visibility || '');

  const [showChatForm, setShowChatForm] = useState(false);
  const [showTeamMemberSelect, setShowTeamMembersSelect] = useState(false);

  const [userIds, setUserIds] = useState(report.assignedUserIds);
  const [departmentIds, setDepartmentIds] = useState(
    report.assignedDepartmentIds
  );

  const onNameChange = e => {
    e.preventDefault();
    setName(e.target.value);
  };

  const toggleChartForm = () => {
    setShowChatForm(!showChatForm);
  };

  const renderButtons = () => {
    return (
      <>
        <Button
          btnStyle="primary"
          size="small"
          icon="plus-circle"
          onClick={toggleChartForm}
        >
          Add a chart
        </Button>
      </>
    );
  };

  const checkNameChange = () => {
    return name !== report.name;
  };

  const reportItem = (item: IChart) => {
    if (item.layout) {
      return (
        <div key={item._id} data-grid={defaultLayout(item)}>
          <div>
            <div>{item.name}</div>
            <span className="db-item-action">edit</span>
            <span className="db-item-action">delete</span>
          </div>
          <Chart chart={item} name={item.name} />
        </div>
      );
    }
    return;
  };

  const handleBackButtonClick = () => {
    if (checkNameChange()) {
      confirm('Do you want to save the change').then(() =>
        reportsEdit(report._id, { name }, history.push('/reports'))
      );
    } else {
      history.push('/reports');
    }
  };

  const switchVisiblitybarTab = (vis: string) => {
    setVisibility(vis);
    setIsPublic(vis === 'public');
    reportsEdit(report._id, { visibility: vis });
  };

  const handleSubmit = () => {
    reportsEdit(report._id, { name, visibility, charts });
  };

  const handleMembersSubmit = () => {
    reportsEdit(
      report._id,
      {
        visibility,
        assignedDepartmentIds: departmentIds,
        assignedUserIds: userIds
      },
      setShowTeamMembersSelect(false)
    );
  };

  const handleDepartmentChange = (deptIds: string[]) => {
    setDepartmentIds(deptIds);
  };

  const handleUserChange = (usrIds: string[]) => {
    setUserIds(usrIds);
  };

  const renderMembersSelectModal = () => {
    return (
      <Modal
        show={showTeamMemberSelect}
        onHide={() => setShowTeamMembersSelect(false)}
      >
        <Modal.Body>
          <SelectMembersForm
            handleDepartmentChange={handleDepartmentChange}
            handleUserChange={handleUserChange}
            userIds={userIds}
            departmentIds={departmentIds}
          />
          <FlexCenter>
            <Button
              btnStyle="primary"
              onClick={() => setShowTeamMembersSelect(false)}
            >
              Cancel
            </Button>
            <Button btnStyle="success" onClick={handleMembersSubmit}>
              Save
            </Button>
          </FlexCenter>
        </Modal.Body>
      </Modal>
    );
  };

  const renderLeftActionBar = () => {
    return (
      <FlexContent>
        <BackButton onClick={handleBackButtonClick}>
          <Icon icon="angle-left" size={20} />
        </BackButton>
        <Title>
          <FormControl
            name="name"
            value={name}
            onChange={onNameChange}
            required={true}
            autoFocus={true}
          />
          <Icon icon="edit-alt" size={16} />
        </Title>

        <CenterBar>
          <Tabs full={true}>
            <TabTitle
              className={isPublic ? 'active' : ''}
              onClick={() => switchVisiblitybarTab('public')}
            >
              {__('Public')}
            </TabTitle>
            <TabTitle
              className={isPublic ? '' : 'active'}
              onClick={() => switchVisiblitybarTab('private')}
            >
              {__('Private')}
            </TabTitle>
          </Tabs>
        </CenterBar>
      </FlexContent>
    );
  };

  const renderRightActionBar = () => {
    const onClickSelectMembers = () => {
      setShowTeamMembersSelect(true);
    };

    return (
      <BarItems>
        {!isPublic ? (
          <>
            <Button
              btnStyle="link"
              size="small"
              icon={'check-circle'}
              onClick={onClickSelectMembers}
            >
              {__('Select  members or department')}
            </Button>
            <Participators participatedUsers={members} limit={100} />
          </>
        ) : null}

        <ActionBarButtonsWrapper>
          {renderButtons()}
          <Button
            btnStyle="success"
            size="small"
            icon={'check-circle'}
            onClick={handleSubmit}
          >
            {__('Save')}
          </Button>
        </ActionBarButtonsWrapper>
      </BarItems>
    );
  };

  return (
    <>
      <Wrapper.Header
        title={report.name || 'Report'}
        breadcrumb={[
          { title: __('Report'), link: '/reports' },
          { title: `${(report && report.name) || ''}` }
        ]}
      />
      <PageContent
        actionBar={
          <Wrapper.ActionBar
            left={renderLeftActionBar()}
            right={renderRightActionBar()}
          />
        }
        transparent={false}
      >
        {showTeamMemberSelect && renderMembersSelectModal()}
        <DragField>{charts?.map(deserializeItem).map(reportItem)}</DragField>
      </PageContent>
    </>
  );
};

export default Report;
