import React from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IDashboardItem } from '../types';
import ChartRenderer from './ChartRenderer';
import DashboardItem from './DashboardItem';
import dragBackground from './drag-background.svg';

const ReactGridLayout = WidthProvider(RGL);

const DragField = styledTS<any>(styled(ReactGridLayout))`
  margin: 16px 28px 50px 28px;
  ${(props) =>
    props.isDragging
      ? `
    background: url(${dragBackground});
    background-repeat: repeat-y;
    background-position: 0px -4px;
    background-size: 100% 52px;
  `
      : ''};
`;

const deserializeItem = (i) => ({
  ...i,
  layout: JSON.parse(i.layout) || {},
  vizState: JSON.parse(i.vizState),
});

const defaultLayout = (i) => ({
  x: i.layout.x || 0,
  y: i.layout.y || 0,
  w: i.layout.w || 4,
  h: i.layout.h || 8,
  minW: 4,
  minH: 8,
});

type Props = {
  dashboardItems: IDashboardItem[];
  dashboardId: string;
  editDashboardItem: (doc: { _id: string; layout: string }) => void;
  removeDashboardItem: (itemId: string) => void;
};

type State = {
  isDragging: boolean;
};
class Dashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { isDragging: false };
  }

  setIsDragging = (value) => {
    this.setState({ isDragging: value });
  };

  onLayoutChange = (newLayout) => {
    const { dashboardItems, editDashboardItem } = this.props;

    newLayout.forEach((l) => {
      const item = dashboardItems.find((i) => i._id.toString() === l.i);
      const toUpdate = JSON.stringify({
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
      });

      if (item && toUpdate !== item.layout) {
        editDashboardItem({
          _id: item._id,
          layout: toUpdate,
        });
      }
    });
  };

  render() {
    const { dashboardItems, dashboardId, removeDashboardItem } = this.props;

    if (dashboardItems.length === 0) {
      return (
        <div
          style={{
            textAlign: 'center',
            padding: 12,
          }}
        >
          <h2>There are no charts on this dashboard</h2>
        </div>
      );
    }

    const dashboardItem = (item) => {
      if (item.layout) {
        const height = item.layout.h * 40;

        return (
          <div key={item._id} data-grid={defaultLayout(item)}>
            <DashboardItem
              key={item._id}
              itemId={item._id}
              dashboardId={dashboardId}
              title={item.name}
              removeDashboardItem={removeDashboardItem}
            >
              <ChartRenderer vizState={item.vizState} chartHeight={height} />
            </DashboardItem>
          </div>
        );
      }
      return;
    };

    return (
      <DragField
        margin={[12, 12]}
        containerPadding={[0, 0]}
        onDragStart={() => this.setIsDragging(true)}
        onDragStop={() => this.setIsDragging(false)}
        onResizeStart={() => this.setIsDragging(true)}
        onResizeStop={() => this.setIsDragging(false)}
        cols={24}
        rowHeight={40}
        onLayoutChange={this.onLayoutChange}
        isDragging={this.state.isDragging}
      >
        {dashboardItems.map(deserializeItem).map(dashboardItem)}
      </DragField>
    );
  }
}

export default Dashboard;
