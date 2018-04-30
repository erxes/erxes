import React from 'react';
import PropTypes from 'prop-types';
import { ResponsiveLine } from '@nivo/line';
import { Spinner } from 'modules/common/components';
import { ChartWrapper, LoaderWrapper } from '../styles';
import { colors } from 'modules/common/styles';

const propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number
};

class Chart extends React.Component {
  render() {
    const { data, height, loading } = this.props;

    if (loading) {
      return (
        <LoaderWrapper>
          <Spinner objective />
        </LoaderWrapper>
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

Chart.propTypes = propTypes;

export default Chart;
