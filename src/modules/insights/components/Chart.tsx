import { ResponsiveLine } from '@nivo/line';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { colors } from 'modules/common/styles';
import React from 'react';
import { ChartWrapper, LoaderWrapper } from '../styles';
import { IChartParams } from '../types';

interface IProps {
  data: IChartParams[];
  loading?: boolean;
  width?: number;
  height: number;
  type?: string;
}

class Chart extends React.Component<IProps> {
  render() {
    const { data, height, loading, type } = this.props;
    let typeId = 'count';
    let marginLeft = 35;

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

    data.filter(axis => {
      if (axis.y > 999) {
        return (marginLeft = 52);
      }

      return null;
    });

    if (type === 'conversation-report') {
      typeId = 'sec';
    }

    const chartData = [{ id: typeId, color: '#eee', data }];

    return (
      <ChartWrapper height={height}>
        <ResponsiveLine
          data={chartData}
          margin={{
            top: 30,
            right: 30,
            bottom: 30,
            left: marginLeft
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
