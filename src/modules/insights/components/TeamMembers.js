import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import { Spinner } from 'modules/common/components';
import Chart from './Chart';
import { convertTime } from '../utils';
import {
  InsightUserData,
  UserProfile,
  FullName,
  LoaderWrapper
} from '../styles';

const propTypes = {
  datas: PropTypes.array.isRequired,
  loading: PropTypes.bool
};

class TeamMembers extends React.Component {
  renderChart(userData, index) {
    const data = userData.data ? userData.data : userData;

    return (
      <Col sm={6} key={index}>
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
          <Spinner objective />
        </LoaderWrapper>
      );
    }

    return (
      <Row>{datas.map((data, index) => this.renderChart(data, index))}</Row>
    );
  }
}

TeamMembers.propTypes = propTypes;

export default TeamMembers;
