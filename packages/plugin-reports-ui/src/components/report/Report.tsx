import { Button, FormControl, Icon } from '@erxes/ui/src/components';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import PageContent from '@erxes/ui/src/layout/components/PageContent';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems, FlexContent } from '@erxes/ui/src/layout/styles';
import { __, confirm, router } from '@erxes/ui/src/utils';
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import {
  ActionBarButtonsWrapper,
  BackButton,
  CenterBar,
  ChartTitle,
  DragField,
  FlexCenter,
  HeightedWrapper,
  ReportContainer,
  Title,
} from '../../styles';
import { IChart, IReport, IReportItem } from '../../types';
import SelectMembersForm from '../utils/SelectMembersForm';
import Participators from './Participators';
import ChartForm from '../../containers/chart/ChartForm';
import ChartRenderer from '../../containers/chart/ChartRenderer';
import { getEnv } from '@erxes/ui/src/utils/core';
import queryString from 'query-string';

const DEFAULT_GRID_DIMENSIONS = {
  w: 3,
  h: 3,
};
const deserializeItem = (i) => {
  return {
    ...i,
    layout: i.layout ? JSON.parse(i.layout) : {},
    vizState: i.vizState ? JSON.parse(i.vizState) : {},
  };
};

const defaultLayout = (i) => ({
  x: i.layout.x || 0,
  y: i.layout.y || 0,
  w: i.layout.w || DEFAULT_GRID_DIMENSIONS.w,
  h: i.layout.h || DEFAULT_GRID_DIMENSIONS.h,
  minW: 1,
  minH: 1,
});

type Props = {
  report: IReport;
  history: any;
  queryParams: any;
  reportsEdit: (reportId: string, values: any, callback?: any) => void;
  reportChartsEdit: (_id: string, values: any, callback?: any) => void;
  reportChartsRemove: (_id: string) => void;
};

const Report = (props: Props) => {
  const {
    report,
    reportsEdit,
    reportChartsEdit,
    reportChartsRemove,
    history,
    queryParams,
  } = props;
  const { charts, members } = report;

  const [reportItems, setReportItems] = useState<IReportItem[]>([]);
  const [isPublic, setIsPublic] = useState(report.visibility === 'public');
  const [name, setName] = useState(report.name || '');
  const [visibility, setVisibility] = useState<string>(report.visibility || '');

  const [currentChart, setCurrentChart] = useState(null);
  const [showChartForm, setShowChartForm] = useState(false);
  const [showTeamMemberSelect, setShowTeamMembersSelect] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [userIds, setUserIds] = useState(report.assignedUserIds);
  const [departmentIds, setDepartmentIds] = useState(
    report.assignedDepartmentIds,
  );

  const [columnsNum, setColumnsNum] = useState(2);

  useEffect(() => {
    setReportItems(charts || []);
  }, [charts]);

  const onNameChange = (e) => {
    e.preventDefault();
    setName(e.target.value);
  };

  const toggleChartAddForm = () => {
    setCurrentChart(null);
    setShowChartForm(!showChartForm);
  };

  const renderButtons = () => {
    return (
      <>
        <Button
          btnStyle="primary"
          size="small"
          icon="plus-circle"
          onClick={toggleChartAddForm}
        >
          Add a chart
        </Button>
      </>
    );
  };

  const checkNameChange = () => {
    return name !== report.name;
  };

  const onDeleteChart = (_id: string) => {
    confirm('Are you sure to delete this chart').then(() => {
      reportChartsRemove(_id);
    });
  };

  const exportTable = (item: IChart) => {
    const stringified = queryString.stringify({
      ...item,
    });
    const { REACT_APP_API_URL } = getEnv();
    window.open(
      `${REACT_APP_API_URL}/pl:reports/report-table-export?${stringified}`,
    );
  };

  const reportItem = (item: IChart) => {
    const { chartType } = item;

    if (item.layout) {
      return (
        <div
          key={item._id || Math.random()}
          data-grid={defaultLayout(item)}
          style={{ overflow: 'hidden' }}
        >
          <ChartTitle>
            <div>{item.name}</div>
            {chartType && chartType === 'table' && (
              <span
                className="db-item-action"
                onClick={() => exportTable(item)}
              >
                export
              </span>
            )}
            <span
              className="db-item-action"
              onClick={() => {
                router.setParams(history, { serviceName: item.serviceName });
                setCurrentChart(item);
                setShowChartForm(true);
              }}
            >
              edit
            </span>
            <span
              className="db-item-action"
              onClick={() => onDeleteChart(item._id)}
            >
              delete
            </span>
          </ChartTitle>
          <ChartRenderer
            history={history}
            queryParams={queryParams}
            chartType={item.chartType}
            chartHeight={defaultLayout(item).h * 160}
            chartVariables={{
              serviceName: item.serviceName,
              templateType: item.templateType,
            }}
            filter={item.filter}
          />
        </div>
      );
    }
    return;
  };

  const handleBackButtonClick = () => {
    if (showChartForm) {
      toggleChartAddForm();
      return;
    }

    if (checkNameChange()) {
      confirm('Do you want to save the change').then(() =>
        reportsEdit(report._id, { name }, history.push('/reports')),
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
        assignedUserIds: userIds,
      },
      setShowTeamMembersSelect(false),
    );
  };

  const handleDepartmentChange = (deptIds: string[]) => {
    setDepartmentIds(deptIds);
  };

  const handleUserChange = (usrIds: string[]) => {
    setUserIds(usrIds);
  };

  const onColumsNumChange = (e) => {
    e.preventDefault();
    setColumnsNum(e.target.value);
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
          {/* <ControlLabel>Enter columns num</ControlLabel>

          <div style={{ width: '10%' }}>
            <FormControl
              type="number"
              inline={true}
              align="center"
              name="columnsNum"
              value={columnsNum}
              onChange={onColumsNumChange}
            />
          </div> */}
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

  const onLayoutChange = (newLayout) => {
    newLayout.forEach((l) => {
      const item = reportItems.find((i) => i._id?.toString() === l.i);
      const toUpdate = JSON.stringify({
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
      });

      if (item && toUpdate !== item.layout) {
        reportChartsEdit(item._id, {
          layout: toUpdate,
        });
      }
    });
  };

  return (
    <HeightedWrapper>
      <ReportContainer>
        <Wrapper.Header
          title={report.name || 'Report'}
          queryParams={queryParams}
          breadcrumb={[
            { title: __('Reports'), link: '/reports' },
            { title: `${(report && report.name) || ''}` },
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
          {!showChartForm && (
            <DragField
              haveChart={charts?.length ? true : false}
              cols={columnsNum * 3}
              margin={[30, 30]}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              onResizeStart={() => setIsDragging(true)}
              onResizeStop={() => setIsDragging(false)}
              onLayoutChange={onLayoutChange}
              isDragging={isDragging}
              rowHeight={160}
              containerPadding={[30, 30]}
              useCSSTransforms={true}
            >
              {charts?.map(deserializeItem).map(reportItem)}
            </DragField>
          )}

          {showChartForm && (
            <ChartForm
              history={history}
              queryParams={queryParams}
              toggleForm={() => setShowChartForm(!showChartForm)}
              showChartForm={showChartForm}
              chart={currentChart}
              reportId={report._id}
            />
          )}
        </PageContent>
      </ReportContainer>
    </HeightedWrapper>
  );
};

export default Report;
