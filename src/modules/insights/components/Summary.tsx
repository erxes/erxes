import { Spinner } from 'modules/common/components';
import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import {
  LoaderWrapper,
  SummaryCount,
  SummaryItem,
  SummaryTitle
} from '../styles';

interface IProps {
  data: any,
  loading: boolean
};

class Summary extends React.Component<IProps> {
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

export default Summary;
