import React from 'react';
import { IDashboardItem } from '../../types';
import ChartRenderer from './ChartRenderer';

type Props = {
  item: IDashboardItem;
};

type State = {
  showEdit: boolean;
};

class DashboardItem extends React.Component<Props, State> {
  render() {
    const { item } = this.props;

    const height = item.layout.h * 160;

    return (
      <ChartRenderer
        chartType={item.vizState.chartType}
        chartHeight={height}
        query={item.vizState.query}
      />
    );
  }
}

export default DashboardItem;
