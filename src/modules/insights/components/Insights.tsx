import { ResponsivePie } from '@nivo/pie';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { __ } from 'modules/common/utils';
import React from 'react';
import { ChartWrapper, FlexItem, InsightTitle, LoaderWrapper } from '../styles';
import { IPieChartData } from '../types';

type Props = {
  data: IPieChartData[];
  loading: boolean;
  title: string;
};

class Insights extends React.Component<Props> {
  render() {
    const { data, loading, title } = this.props;

    if (loading) {
      return (
        <LoaderWrapper>
          <Spinner objective={true} />
        </LoaderWrapper>
      );
    }

    let content;

    if (data.length === 0) {
      content = (
        <EmptyState text="There is no data" size="full" icon="piechart" />
      );
    } else {
      content = (
        <ResponsivePie
          data={data}
          margin={{
            top: 40,
            right: 80,
            bottom: 40,
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
        />
      );
    }

    return (
      <FlexItem>
        <InsightTitle>{__(title)}</InsightTitle>
        <ChartWrapper height={320}>{content}</ChartWrapper>
      </FlexItem>
    );
  }
}

export default Insights;
