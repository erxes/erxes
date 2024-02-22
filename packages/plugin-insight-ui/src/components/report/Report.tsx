import React, { useRef, useState } from 'react';
import RTG from 'react-transition-group';
import Dropdown from 'react-bootstrap/Dropdown';
import queryString from 'query-string';

import PageContent from '@erxes/ui/src/layout/components/PageContent';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import { Title } from '@erxes/ui-settings/src/styles';
import { getEnv } from '@erxes/ui/src/utils/index';
import { __ } from '@erxes/ui/src/utils/index';
import { BarItems } from '@erxes/ui/src';

import ChartRenderer from '../../containers/chart/ChartRenderer';
import Participators from '../utils/Participators';
import Form from '../../containers/chart/Form';
import SelectMembersPopover from '../utils/SelectMembersPopover';
import SelectDashboard from '../../containers/utils/SelectDashboard';
import { IReport } from '../../types';
import {
  ChartTitle,
  DragField,
  ContentContainer,
  RightDrawerContainer,
} from '../../styles';

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

type Props = {
  queryParams: any;
  history: any;

  report: IReport;
  loading: boolean;

  reportChartsRemove: (_id: string) => void;
  reportChartsEdit: (_id: string, values: any) => void;
  reportDuplicate: (_id: string) => void;
  reportRemove: (ids: string[]) => void;
};

const Report = (props: Props) => {
  const {
    queryParams,
    history,
    report,
    loading,
    reportChartsRemove,
    reportChartsEdit,
    reportDuplicate,
    reportRemove,
  } = props;

  const { charts = [] } = report;
  const wrapperRef = useRef<any>(null);
  const [showDrawer, setShowDrawer] = useState<any>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentChart, setCurrentChart] = useState<any | undefined>(undefined);

  const closeDrawer = () => {
    setShowDrawer(false);
    setCurrentChart({});
  };

  const renderActionBar = () => {
    const leftActionBar = <Title>{__(`${report.name || ''}`)}</Title>;

    const trigger = (
      <div>
        {report && !!report?.members?.length ? (
          <Participators participatedUsers={report.members} limit={4} />
        ) : (
          <Button btnStyle="simple" icon="users-alt">
            Add User
          </Button>
        )}
      </div>
    );

    const rightActionBar = (
      <BarItems>
        {report.visibility === 'private' && (
          <SelectMembersPopover
            targets={[report]}
            trigger={trigger}
            type="report"
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
        <SelectDashboard
          queryParams={queryParams}
          history={history}
          data={report}
        />
        <Dropdown drop="down" alignRight={true}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
            <Button btnStyle="simple" icon="ellipsis-h" />
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-container">
            <li>
              <a
                href="#duplicate"
                onClick={() => {
                  reportDuplicate(report._id);
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
                  reportRemove([report._id]);
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

  const exportTable = (item: any) => {
    const stringified = queryString.stringify({
      ...item,
    });
    const { REACT_APP_API_URL } = getEnv();
    window.open(
      `${REACT_APP_API_URL}/pl:reports/report-table-export?${stringified}`,
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
        emptyText={__('No data for this report')}
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
            <RightDrawerContainer width={1100}>
              {
                <Form
                  history={history}
                  queryParams={queryParams}
                  chart={currentChart}
                  item={report}
                  type="report"
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

export default Report;
