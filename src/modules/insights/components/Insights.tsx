import { ResponsivePie } from '@nivo/pie';
import { Spinner } from 'modules/common/components';
import * as React from 'react';
import { ChartWrapper, LoaderWrapper } from '../styles';
import { InsightParams } from '../types';

type Props = {
  data: InsightParams[],
  loading: boolean
};

class Insights extends React.Component<Props> {
  render() {
    const { data, loading } = this.props;

    if (loading) {
      return (
        <LoaderWrapper>
          <Spinner objective />
        </LoaderWrapper>
      );
    }

    return (
      <ChartWrapper height={360}>
        <ResponsivePie
          data={data}
          margin={{
            top: 40,
            right: 80,
            bottom: 80,
            left: 80
          }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          colors="nivo"
          colorBy="id"
          borderColor="inherit:darker(0.6)"
          radialLabelsSkipAngle={10}
          radialLabelsTextXOffset={6}
          radialLabelsTextColor="#333333"
          radialLabelsLinkOffset={0}
          radialLabelsLinkDiagonalLength={16}
          radialLabelsLinkHorizontalLength={24}
          radialLabelsLinkStrokeWidth={1}
          radialLabelsLinkColor="inherit"
          slicesLabelsSkipAngle={10}
          slicesLabelsTextColor="#333333"
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              translateY: 56,
              itemWidth: 100,
              itemHeight: 14,
              symbolSize: 14,
              symbolShape: 'circle'
            }
          ]}
        />
      </ChartWrapper>
    );
  }
}

export default Insights;
