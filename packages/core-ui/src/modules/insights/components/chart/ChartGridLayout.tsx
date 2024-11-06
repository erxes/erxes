import { ChartTitle } from "../../styles";
import React, { useEffect, useState } from "react";
import { defaultLayout } from "../../utils";
import ChartRenderer from "../../containers/chart/ChartRenderer";
import { IChart } from "../../types";

type Props = {
  queryParams: any;
  chart: IChart;
  chartType: string;
  showDrawer: boolean;
  chartIndex: number;
  exportTable: (chart: IChart) => void;
  setCurrentChart: (chart: IChart) => void;
  setShowDrawer: (showDrawer: boolean) => void;
  handleChartDelete: (_id: string) => void;
  dashboardChartsEdit: (_id: string, values: any) => void;
  chartDuplicate: (_id: string) => void;
};

const ChartGridLayout = (props: Props) => {
  const {
    queryParams,
    chart,
    chartType,
    showDrawer,
    chartIndex,
    exportTable,
    setCurrentChart,
    setShowDrawer,
    handleChartDelete,
    dashboardChartsEdit,
    chartDuplicate
  } = props;

  const [filters, setFilters] = useState<any>(chart.filter || {});
  const [layout, setLayout] = useState<any>(chart.layout || {});

  useEffect(() => {
    setFilters(chart.filter || {});
  }, [chart.filter]);

  useEffect(() => {
    if (JSON.stringify(layout) !== JSON.stringify(chart.layout)) {
      setLayout(chart.layout || {});
    }
  }, [chart.layout]);

  const setFilter = (fieldName: string, value: any) => {
    setFilters(prevFilters => {
      if (
        value === undefined ||
        value === null ||
        (Array.isArray(value) && !value.length)
      ) {
        const { [fieldName]: omitted, ...updatedFilters } = prevFilters;
        return updatedFilters;
      }

      const updatedFilters = { ...prevFilters, [fieldName]: value };

      dashboardChartsEdit(chart._id, { filter: updatedFilters });

      return updatedFilters;
    });
  };

  const handleLock = () => {
    const newStatic = !layout.static;
    const updatedLayout = JSON.stringify({ ...layout, static: newStatic });

    setLayout(updatedLayout);

    dashboardChartsEdit(chart._id, { layout: updatedLayout });
  };

  return (
    <>
      <ChartTitle>
        <div>{chart.name}</div>
        <span className="db-chart-action" onClick={handleLock}>
          {!layout.static ? "lock" : "unlock"}
        </span>
        <span
          className="db-chart-action"
          onClick={() => chartDuplicate(chart._id)}
        >
          duplicate
        </span>
        {chartType && (chartType === "table" || chartType === "pivotTable") && (
          <span className="db-chart-action" onClick={() => exportTable(chart)}>
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
        queryParams={queryParams}
        chartType={chart.chartType}
        chartHeight={defaultLayout(chart, chartIndex).h * 160}
        chartVariables={{
          serviceName: chart.serviceName,
          templateType: chart.templateType
        }}
        filter={filters}
        setFilter={setFilter}
        dimension={chart.dimension}
      />
    </>
  );
};

export default ChartGridLayout;
