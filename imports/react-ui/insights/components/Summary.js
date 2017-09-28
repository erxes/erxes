import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';

const propTypes = {
  data: PropTypes.array.isRequired,
};

class Summary extends React.Component {
  renderSummary(sum) {
    return (
      <Col sm={3} key={Math.random()}>
        <div className="summary-item">
          <div className="summary-title">
            {sum.title}
          </div>
          <span className="summary-count">
            {sum.count}
          </span>
        </div>
      </Col>
    );
  }

  render() {
    const { data } = this.props;
    return (
      <Row>
        {data.map(detail => this.renderSummary(detail))}
      </Row>
    );
  }
}

Summary.propTypes = propTypes;

export default Summary;
