import Spinner from 'modules/common/components/Spinner';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import {
  LoaderWrapper,
  SummaryCount,
  SummaryItem,
  SummaryTitle
} from '../styles';

type Props = {
  data: any;
  loading: boolean;
  isSmall?: boolean;
};

class Summary extends React.Component<Props> {
  renderSummary(item, index) {
    if (typeof item === 'number') {
      return (
        <Col sm={3} key={Math.random()}>
          <SummaryItem isSmall={this.props.isSmall}>
            <SummaryTitle>
              <span>
                {index === 3 ? '4 sec ++' : `${index} - ${index + 1} sec`}
              </span>
            </SummaryTitle>
            <SummaryCount>{item}</SummaryCount>
          </SummaryItem>
        </Col>
      );
    }

    return (
      <Col sm={3} key={Math.random()}>
        <SummaryItem>
          <SummaryTitle>{item.title}</SummaryTitle>
          <SummaryCount>
            {item.count
              ? item.count.toLocaleString(undefined, {
                  maximumFractionDigits: 2
                })
              : 0}
          </SummaryCount>
        </SummaryItem>
      </Col>
    );
  }

  render() {
    const { data, loading } = this.props;

    if (loading) {
      return (
        <LoaderWrapper>
          <Spinner objective={true} />
        </LoaderWrapper>
      );
    }

    return (
      <Row>
        {data.map((detail, index) => this.renderSummary(detail, index))}
      </Row>
    );
  }
}

export default Summary;
