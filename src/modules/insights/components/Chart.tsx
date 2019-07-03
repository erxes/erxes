import { ResponsiveLine } from '@nivo/line';
import { EmptyState, Spinner } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import React from 'react';
import { ChartWrapper, LoaderWrapper } from '../styles';
import { IChartParams } from '../types';

interface IProps {
  data: IChartParams[];
  loading?: boolean;
  width?: number;
  height: number;
}

class Chart extends React.Component<IProps> {
  render() {
    const { data, height, loading } = this.props;

    if (loading) {
      return (
        <LoaderWrapper>
          <Spinner objective={true} />
        </LoaderWrapper>
      );
    }

    if (this.props.data.length === 0) {
      return (
        <ChartWrapper>
          <EmptyState text="There is no data" size="full" icon="piechart" />
        </ChartWrapper>
      );
    }

    const chartData = [{ id: 'count', color: '#eee', data }];

    return (
      <ChartWrapper height={height}>
        <ResponsiveLine
          data={chartData}
          margin={{
            top: 30,
            right: 30,
            bottom: 30,
            left: 30
          }}
          colors={[colors.colorPrimary]}
          enableArea={true}
          enableGridX={false}
          minY="auto"
          dotSize={8}
          dotBorderWidth={1}
          dotBorderColor="#ffffff"
          dotLabel="y"
          dotLabelYOffset={-12}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          curve="monotoneX"
        />
      </ChartWrapper>
    );
  }
}

export default Chart;
