import * as React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import { Spinner } from 'modules/common/components';
import {
  SummaryItem,
  SummaryTitle,
  SummaryCount,
  LoaderWrapper
} from '../styles';

const propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool
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
    const { data, loading } = this.props;

    if (loading) {
      return (
        <LoaderWrapper>
          <Spinner objective />
        </LoaderWrapper>
      );
    }

    return <Row>{data.map(detail => this.renderSummary(detail))}</Row>;
  }
}

Summary.propTypes = propTypes;

export default Summary;
