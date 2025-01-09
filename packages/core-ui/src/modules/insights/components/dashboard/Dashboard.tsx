import { ChartTitle, ContentContainer, DragField } from "../../styles";
import React, { useRef, useState } from "react";
import { defaultLayout, deserializeItem } from "../../utils";

import { BarItems } from "@erxes/ui/src";
import Button from "@erxes/ui/src/components/Button";
import { CSSTransition } from "react-transition-group";
import ChartRenderer from "../../containers/chart/ChartRenderer";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import Form from "../../containers/chart/Form";
import { IDashboard } from "../../types";
import Icon from "@erxes/ui/src/components/Icon";
import PageContent from "@erxes/ui/src/layout/components/PageContent";
import Participators from "../utils/Participators";
import { RightDrawerContainer } from "../../styles";
import SelectMembersPopover from "../utils/SelectMembersPopover";
import { Title } from "@erxes/ui-settings/src/styles";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "@erxes/ui/src/utils/index";
import confirm from "@erxes/ui/src/utils/confirmation/confirm";
import { getEnv } from "@erxes/ui/src/utils/index";
import queryString from "query-string";
import ChartGridLayout from "../chart/ChartGridLayout";

type Props = {
  queryParams: any;
  dashboard: IDashboard;
  loading: boolean;
  dashboardChartsRemove: (_id: string) => void;
  dashboardChartsEdit: (_id: string, values: any) => void;
  dashboardDuplicate: (_id: string) => void;
  dashboardRemove: (ids: string) => void;
  chartDuplicate: (_id: string) => void;
};

const Dashboard = (props: Props) => {
  const {
    queryParams,
    dashboard,
    loading,
    dashboardChartsRemove,
    dashboardChartsEdit,
    dashboardDuplicate,
    dashboardRemove,
    chartDuplicate
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
    const leftActionBar = <Title>{`${dashboard.name || ""}`}</Title>;

    const trigger = (
      <div>
        {dashboard && !!dashboard?.members?.length ? (
          <Participators participatedUsers={dashboard.members} limit={4} />
        ) : (
          <Button btnStyle="success" icon="users-alt" size="small">
            Add User
          </Button>
        )}
      </div>
    );

    const rightActionBar = (
      <BarItems>
        {dashboard.visibility === "private" && (
          <SelectMembersPopover
            targets={[dashboard]}
            trigger={trigger}
            type="dashboard"
          />
        )}
        <Button
          btnStyle="success"
          icon="plus-circle"
          size="small"
          onClick={() => {
            setCurrentChart(undefined);
            setShowDrawer(!showDrawer);
          }}
        >
          Add Chart
        </Button>
        <Dropdown
          drop="down"
          as={DropdownToggle}
          toggleComponent={
            <Button btnStyle="simple" size="small">
              Actions
            </Button>
          }
        >
          <li>
            <a
              href="#duplicate"
              onClick={() => {
                dashboardDuplicate(dashboard._id);
              }}
            >
              <Icon icon="copy" />
              &nbsp;
              {__("Duplicate")}
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
              &nbsp;
              {__("Delete")}
            </a>
          </li>
        </Dropdown>
      </BarItems>
    );

    return <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />;
  };

  const handleChartDelete = (_id: string) => {
    confirm("Are you sure to delete this chart").then(() => {
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
        static: l.static || false,
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
      filter: JSON.stringify(item.filter),
      dimension: JSON.stringify(item.dimension),
      layout: JSON.stringify(item.layout),
      vizState: JSON.stringify(item.vizState),
      chartType: "table",
    });

    const { REACT_APP_API_URL } = getEnv();
    window.open(
      `${REACT_APP_API_URL}/chart-table-export?${stringified}`
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
        style={{ overflow: "hidden" }}
      >
        <ChartGridLayout
          queryParams={queryParams}
          chart={chart}
          chartType={chartType}
          showDrawer={showDrawer}
          chartIndex={index}
          exportTable={exportTable}
          setCurrentChart={setCurrentChart}
          setShowDrawer={setShowDrawer}
          handleChartDelete={handleChartDelete}
          dashboardChartsEdit={dashboardChartsEdit}
          chartDuplicate={chartDuplicate}
        />
      </div>
    );
  };

  const renderContent = () => {
    return (
      <DataWithLoader
        data={
          <DragField
            haveChart={(charts || []).length ? true : false}
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
            resizeHandles={["s", "w", "e", "n", "sw", "nw", "se", "ne"]}
          >
            {(charts || []).map(deserializeItem).map(renderChart)}
          </DragField>
        }
        loading={loading}
        emptyText={__("No data for this dashboard")}
        emptyImage="/images/actions/11.svg"
      />
    );
  };

  return (
    <ContentContainer>
      <PageContent actionBar={renderActionBar()} transparent={false}>
        {renderContent()}

        <div ref={wrapperRef}>
          <CSSTransition
            in={showDrawer}
            timeout={300}
            classNames="slide-in-right"
            unmountOnExit={true}
          >
            <RightDrawerContainer width={100}>
              {
                <Form
                  queryParams={queryParams}
                  chart={currentChart}
                  item={dashboard}
                  type="dashboard"
                  closeDrawer={closeDrawer}
                />
              }
            </RightDrawerContainer>
          </CSSTransition>
        </div>
      </PageContent>
    </ContentContainer>
  );
};

export default Dashboard;