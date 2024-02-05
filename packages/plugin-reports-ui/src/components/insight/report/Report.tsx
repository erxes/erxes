import {
  Button,
  BarItems,
  Wrapper,
  __,
  Icon,
  getEnv,
  confirm,
  DataWithLoader,
} from '@erxes/ui/src';
import React, { memo, useRef, useState } from 'react';
import { IChart, IReport } from '../../../types';
import { FlexRow, Title } from '@erxes/ui-settings/src/styles';
import { Actions, Column, FlexHeight } from '@erxes/ui/src/styles/main';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Dropdown from 'react-bootstrap/Dropdown';
import {
  ChartTitle,
  DragField,
  FlexColumn,
  RightDrawerContainer,
} from '../../../styles';
import ChartRenderer from '../../../containers/chart/ChartRenderer';
import queryString from 'query-string';
import List from '../List';
import RTG from 'react-transition-group';
import { Columns } from '@erxes/ui/src/styles/chooser';

type Props = {
  queryParams: any;
  history: any;
  report: IReport;
  loading: boolean;
  reportChartsRemove: (_id: string) => void;
  reportChartsEdit: (_id: string, values: any) => void;
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

const defaultLayout = (i) => ({
  x: i.layout.x || 0,
  y: i.layout.y || 0,
  w: i.layout.w || DEFAULT_GRID_DIMENSIONS.w,
  h: i.layout.h || DEFAULT_GRID_DIMENSIONS.h,
  minW: 1,
  minH: 1,
});

const Report = (props: Props) => {
  const {
    queryParams,
    history,
    report,
    loading,
    reportChartsRemove,
    reportChartsEdit,
  } = props;

  const { charts } = report;
  const [isDragging, setIsDragging] = useState(false);

  const renderActionBar = () => {
    const leftActionBar = <Title>{__(`${report.name || ''}`)}</Title>;

    const rightActionBar = (
      <BarItems>
        {report.visibility === 'private' && (
          <Button btnStyle="simple">Add User</Button>
        )}
        <Button btnStyle="simple" onClick={() => {}}>
          Add Chart
        </Button>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
            <Button btnStyle="simple" icon="ellipsis-h" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li>
              <a href="#duplicate" onClick={() => {}}>
                {__('Duplicate')}
              </a>
            </li>
            <li>
              <a href="#delete" onClick={() => {}}>
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
      reportChartsRemove(_id);
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
        reportChartsEdit(item._id, {
          layout: toUpdate,
        });
      }
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

  const renderChart = (chart: IChart) => {
    const { chartType } = chart;

    if (!chart.layout) {
      return null;
    }

    return (
      <div
        key={chart._id || Math.random()}
        data-grid={defaultLayout(chart)}
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
              // router.setParams(history, { serviceName: chart.serviceName });
              // setCurrentChart(chart);
              // setShowChartForm(true);
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
          chartHeight={defaultLayout(chart).h * 160}
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
            onDragEnd={() => setIsDragging(false)}
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
        emptyText={__('No data for this report')}
        emptyImage="/images/actions/11.svg"
      />
    );
  };

  return (
    <>
      {renderActionBar()}
      {renderContent()}
    </>
  );
};

export default Report;
