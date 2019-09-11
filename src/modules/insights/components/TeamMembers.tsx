import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import {
  ChartWrapper,
  FullName,
  InsightUserData,
  LoaderWrapper,
  UserProfile
} from '../styles';
import { IChartParams } from '../types';
import { convertTime } from '../utils';
import Chart from './Chart';
import Summary from './Summary';

type Props = {
  datas: IChartParams[];
  loading: boolean;
  type?: string;
};

class TeamMembers extends React.Component<Props> {
  renderChart(userData, index) {
    const data = userData.data ? userData.data : userData;

    return (
      <Col sm={6} key={index}>
        {userData.summaries ? (
          <Summary isSmall={true} loading={false} data={userData.summaries} />
        ) : null}

        <InsightUserData>
          <UserProfile>
            <img
              src={data.avatar || '/images/avatar-colored.svg'}
              alt={data.fullName}
            />

            <FullName>{data.fullName}</FullName>

            {userData.time ? (
              <span>&nbsp; ({convertTime(userData.time)})</span>
            ) : null}
          </UserProfile>
          <Chart height={240} data={data.graph} type={this.props.type} />
        </InsightUserData>
      </Col>
    );
  }

  render() {
    const { datas, loading } = this.props;

    if (loading) {
      return (
        <LoaderWrapper>
          <Spinner objective={true} />
        </LoaderWrapper>
      );
    }

    if (datas.length === 0) {
      return (
        <ChartWrapper>
          <EmptyState text="There is no data" size="full" icon="piechart" />
        </ChartWrapper>
      );
    }

    return (
      <Row>{datas.map((data, index) => this.renderChart(data, index))}</Row>
    );
  }
}

export default TeamMembers;
