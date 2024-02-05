import React, { memo } from 'react';
import { IChart } from '../../../../types';
import { ChartTitle } from '../../../../styles';
import ChartRenderer from '../../../../containers/chart/ChartRenderer';
import queryString from 'query-string';
import { confirm, getEnv } from '@erxes/ui/src';

type Props = {
  chart: IChart;
  queryParams: any;
  reportChartsRemove: (_id: string) => void;
  reportChartsEdit: (_id: string, values: any) => void;
};

const DEFAULT_GRID_DIMENSIONS = {
  w: 3,
  h: 3,
};

const defaultLayout = (i) => ({
  x: i.layout.x || 0,
  y: i.layout.y || 0,
  w: i.layout.w || DEFAULT_GRID_DIMENSIONS.w,
  h: i.layout.h || DEFAULT_GRID_DIMENSIONS.h,
  minW: 1,
  minH: 1,
});

const Chart = (props: Props) => {
  const { chart, queryParams, reportChartsRemove, reportChartsEdit } = props;

  const { chartType } = chart;

  if (!chart.layout) {
    return null;
  }

  const handleChartDelete = (_id: string) => {
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

  return (
    <div data-grid={defaultLayout(chart)} style={{ overflow: 'hidden' }}>
      <ChartTitle>
        <div>{chart.name}</div>
        {chartType && chartType === 'table' && (
          <span className="db-chart-action" onClick={() => exportTable(chart)}>
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

export default memo(Chart);
