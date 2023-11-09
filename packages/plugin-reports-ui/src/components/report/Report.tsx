import React, { useState } from 'react';
import { IChart, IReport, IReportItem } from '../../types';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __, confirm } from '@erxes/ui/src/utils';
import PageContent from '@erxes/ui/src/layout/components/PageContent';
import {
  ActionBarButtonsWrapper,
  BackButton,
  CenterBar,
  DragField,
  Title
} from '../../styles';
import { Link } from 'react-router-dom';
import Chart from '../chart/Chart';
import { BarItems, FlexContent } from '@erxes/ui/src/layout/styles';
import { Button, FormControl, Icon } from '@erxes/ui/src/components';

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
  reportsEdit: (reportId: string, values: any) => void;
};

const Report = (props: Props) => {
  const { report, reportsEdit, history } = props;
  const { charts } = report;
  const [isPublic, setIsPublic] = useState(report.visibility === 'public');
  const [name, setName] = useState(report.name || '');
  const [visibility, setVisibility] = useState(report.visibility);

  const [showChatForm, setShowChatForm] = useState(false);

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
        reportsEdit(report._id, { name })
      );

      history.push('/reports');
    } else {
      history.push('/reports');
    }
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
              // onClick={switchVisiblitybarTab.bind(this, 'public')}
            >
              {__('Public')}
            </TabTitle>
            <TabTitle
              className={isPublic ? '' : 'active'}
              // onClick={switchVisiblitybarTab.bind(this, 'private')}
            >
              {__('Private')}
            </TabTitle>
          </Tabs>
        </CenterBar>
      </FlexContent>
    );
  };

  const renderRightActionBar = () => {
    // const { isPublic } = state;

    // const { dashboard } = props;

    // const members = dashboard.members || ([] as IUser[]);

    // const onClickButton = () => {
    //   setState({ showTeamMemberSelect: true });
    // };

    return (
      <BarItems>
        {!isPublic ? (
          <>
            <Button
              btnStyle="link"
              size="small"
              icon={'check-circle'}
              // onClick={onClickButton}
            >
              {__('Select  members or department')}
            </Button>
            {/* <Participators participatedUsers={members} limit={100} /> */}
          </>
        ) : null}

        <ActionBarButtonsWrapper>
          {renderButtons()}
          <Button
            btnStyle="success"
            size="small"
            icon={'check-circle'}
            // onClick={handleSubmit}
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
        <DragField>{charts?.map(deserializeItem).map(reportItem)}</DragField>
      </PageContent>
    </>
  );
};

export default Report;
