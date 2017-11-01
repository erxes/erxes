import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import { SummaryItem, SummaryTitle, SummaryCount } from '../styles';

const propTypes = {
  data: PropTypes.array.isRequired
};

class Summary extends React.Component {
  renderSummary(sum) {
    return (
      <Col sm={3} key={Math.random()}>
        <SummaryItem>
          <SummaryTitle>{sum.title}</SummaryTitle>
          <SummaryCount>{sum.count}</SummaryCount>
        </SummaryItem>
      </Col>
    );
  }

  render() {
    const { data } = this.props;
    return <Row>{data.map(detail => this.renderSummary(detail))}</Row>;
  }
}

Summary.propTypes = propTypes;

export default Summary;
