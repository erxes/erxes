import { EmptyState, Spinner } from 'modules/common/components';
import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Summary } from '.';
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

type Props = {
  datas: IChartParams[];
  loading: boolean;
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
            <a>
              <img
                src={data.avatar || '/images/avatar-colored.svg'}
                alt={data.fullName}
              />
            </a>
            <FullName>{data.fullName}</FullName>

            {userData.time ? (
              <span>&nbsp; ({convertTime(userData.time)})</span>
            ) : null}
          </UserProfile>
          <Chart height={240} data={data.graph} />
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
