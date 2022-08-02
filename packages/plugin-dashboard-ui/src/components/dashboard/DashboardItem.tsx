import React from 'react';
import { IDashboardItem } from '../../types';
import ChartRenderer from './ChartRenderer';

type Props = {
  item: IDashboardItem;
};

type State = {
  isDragging: boolean;
  name: string;
};

class DashboardItem extends React.Component<Props, State> {
  render() {
    const { item } = this.props;

    const height = item.layout.h * 160;

    return (
      <div>
        <ChartRenderer
          chartType={item.vizState.chartType}
          chartHeight={height}
          query={item.vizState.query}
        />
      </div>
    );
  }
}

export default DashboardItem;
