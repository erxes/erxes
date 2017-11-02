import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import Chart from './Chart';
import { convertTime } from '../utils';
import { InsightUserData, UserProfile, FullName } from '../styles';

const propTypes = {
  datas: PropTypes.array.isRequired,
  width: PropTypes.number
};

class TeamMembers extends React.Component {
  renderChart(userData, index) {
    const { width } = this.props;
    const data = userData.data ? userData.data : userData;

    return (
      <Col sm={6} key={index}>
        <InsightUserData>
          <UserProfile>
            <a>
              <img
                src={data.avatar || '/images/userDefaultIcon.png'}
                alt={data.fullName}
              />
            </a>
            <FullName>{data.fullName}</FullName>

            {userData.time ? (
              <span>&nbsp; ({convertTime(userData.time)})</span>
            ) : null}
          </UserProfile>
          <Chart width={width * 0.45} height={200} data={data.graph} />
        </InsightUserData>
      </Col>
    );
  }

  render() {
    const { datas } = this.props;

    return (
      <Row>{datas.map((data, index) => this.renderChart(data, index))}</Row>
    );
  }
}

TeamMembers.propTypes = propTypes;

export default TeamMembers;
