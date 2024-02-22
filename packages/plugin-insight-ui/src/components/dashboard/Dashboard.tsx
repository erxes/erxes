import React, { useState, useRef } from 'react';
import RTG from 'react-transition-group';

import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import PageContent from '@erxes/ui/src/layout/components/PageContent';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Icon from '@erxes/ui/src/components/Icon';
import Button from '@erxes/ui/src/components/Button';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import ChartRenderer from '../../containers/chart/ChartRenderer';
import queryString from 'query-string';
import { Title } from '@erxes/ui-settings/src/styles';
import { BarItems } from '@erxes/ui/src';
import { __ } from '@erxes/ui/src/utils/index';
import { getEnv } from '@erxes/ui/src/utils/index';

import Participators from '../utils/Participators';
import Form from '../../containers/chart/Form';
import SelectMembersPopover from '../utils/SelectMembersPopover';
import { ChartTitle, ContentContainer, DragField } from '../../styles';
import { RightDrawerContainer } from '../../styles';
import { IDashboard } from '../../types';

type Props = {
  queryParams: any;
  history: any;
  dashboard: IDashboard;
  loading: boolean;
  dashboardChartsRemove: (_id: string) => void;
  dashboardChartsEdit: (_id: string, values: any) => void;
  dashboardDuplicate: (_id: string) => void;
  dashboardRemove: (ids: string) => void;
};

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

const defaultLayout = (i, index) => ({
  x: i.layout.x || 0,
  y: i.layout.y || 0,
  w: i.layout.w || DEFAULT_GRID_DIMENSIONS.w,
  h: i.layout.h || DEFAULT_GRID_DIMENSIONS.h,
  minW: 1,
  minH: 1,
});

const Dashboard = (props: Props) => {
  const {
    queryParams,
    history,
    dashboard,
    loading,
    dashboardChartsRemove,
    dashboardChartsEdit,
    dashboardDuplicate,
    dashboardRemove,
  } = props;

  const { charts = [] } = dashboard;
  const wrapperRef = useRef<any>(null);

  const [showDrawer, setShowDrawer] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentChart, setCurrentChart] = useState<any | undefined>(undefined);

  const closeDrawer = () => {
    setShowDrawer(false);
    setCurrentChart({});
  };

  const renderActionBar = () => {
    const leftActionBar = <Title>{__(`${dashboard.name || ''}`)}</Title>;

    const trigger = (
      <div>
        {dashboard && !!dashboard?.members?.length ? (
          <Participators participatedUsers={dashboard.members} limit={4} />
        ) : (
          <Button btnStyle="simple" icon="users-alt">
            Add User
          </Button>
        )}
      </div>
    );

    const rightActionBar = (
      <BarItems>
        {/* <Button btnStyle="simple" onClick={() => {}} icon="arrow-to-bottom">
          Export
        </Button> */}
        {dashboard.visibility === 'private' && (
          <SelectMembersPopover
            targets={[dashboard]}
            trigger={trigger}
            type="dashboard"
          />
        )}
        <Button
          btnStyle="simple"
          onClick={() => {
            setCurrentChart(undefined);
            setShowDrawer(!showDrawer);
          }}
        >
          Add Chart
        </Button>
        {/* <Button btnStyle="simple" onClick={() => {}} icon="share-alt">
          Share
        </Button> */}
        <Dropdown drop="down" alignRight={true}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
            <Button btnStyle="simple" icon="ellipsis-h" />
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-container">
            <li>
              <a
                href="#duplicate"
                onClick={() => {
                  dashboardDuplicate(dashboard._id);
                }}
              >
                <Icon icon="copy" />
                {__('Duplicate')}
              </a>
            </li>
            <li>
              <a
                href="#delete"
                onClick={() => {
                  dashboardRemove(dashboard._id);
                }}
              >
                <Icon icon="trash-alt" />

                {__('Delete')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </BarItems>
    );

    return <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />;
  };

  const handleChartDelete = (_id: string) => {
    confirm('Are you sure to delete this chart').then(() => {
      dashboardChartsRemove(_id);
    });
  };

  const onLayoutChange = (newLayout) => {
    newLayout.forEach((l) => {
      const item = charts?.find((i) => i._id?.toString() === l.i);
      const toUpdate = JSON.stringify({
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
      });

      if (item && toUpdate !== item.layout) {
        dashboardChartsEdit(item._id, {
          layout: toUpdate,
        });
      }
    });
  };

  const exportTable = (item: any) => {
    const stringified = queryString.stringify({
      ...item,
    });
    const { REACT_APP_API_URL } = getEnv();
    window.open(
      `${REACT_APP_API_URL}/pl:dashboards/dashboard-table-export?${stringified}`,
    );
  };

  const renderChart = (chart: any, index: number) => {
    const { chartType } = chart;

    if (!chart.layout) {
      return null;
    }

    return (
      <div
        key={chart._id || Math.random()}
        data-grid={defaultLayout(chart, index)}
        style={{ overflow: 'hidden' }}
      >
        <ChartTitle>
          <div>{chart.name}</div>
          {chartType && chartType === 'table' && (
            <span
              className="db-chart-action"
              onClick={() => exportTable(chart)}
            >
              export
            </span>
          )}
          <span
            className="db-chart-action"
            onClick={() => {
              setCurrentChart(chart);
              setShowDrawer(!showDrawer);
            }}
          >
            edit
          </span>
          <span
            className="db-chart-action"
            onClick={() => handleChartDelete(chart._id)}
          >
            delete
          </span>
        </ChartTitle>
        <ChartRenderer
          history={history}
          queryParams={queryParams}
          chartType={chart.chartType}
          chartHeight={defaultLayout(chart, index).h * 160}
          chartVariables={{
            serviceName: chart.serviceName,
            templateType: chart.templateType,
          }}
          filter={chart.filter}
          dimension={chart.dimension}
        />
      </div>
    );
  };

  const renderContent = () => {
    return (
      <DataWithLoader
        data={
          <DragField
            haveChart={charts?.length ? true : false}
            cols={2 * 3}
            margin={[30, 30]}
            onDragStart={() => setIsDragging(true)}
            onDragStop={() => setIsDragging(false)}
            onResizeStart={() => setIsDragging(true)}
            onResizeStop={() => setIsDragging(false)}
            onLayoutChange={onLayoutChange}
            isDragging={isDragging}
            rowHeight={160}
            containerPadding={[30, 30]}
            useCSSTransforms={true}
          >
            {charts?.map(deserializeItem).map(renderChart)}
          </DragField>
        }
        loading={loading}
        emptyText={__('No data for this dashboard')}
        emptyImage="/images/actions/11.svg"
      />
    );
  };

  return (
    <ContentContainer>
      <PageContent actionBar={renderActionBar()} transparent={false}>
        {renderContent()}

        <div ref={wrapperRef}>
          <RTG.CSSTransition
            in={showDrawer}
            timeout={300}
            classNames="slide-in-right"
            unmountOnExit={true}
          >
            <RightDrawerContainer width={100}>
              {
                <Form
                  history={history}
                  queryParams={queryParams}
                  chart={currentChart}
                  item={dashboard}
                  type="dashboard"
                  closeDrawer={closeDrawer}
                />
              }
            </RightDrawerContainer>
          </RTG.CSSTransition>
        </div>
      </PageContent>
    </ContentContainer>
  );
};

export default Dashboard;
