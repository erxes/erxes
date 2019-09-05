import Spinner from 'modules/common/components/Spinner';
import { __ } from 'modules/common/utils';
import React from 'react';
import {
  LoaderWrapper,
  Row,
  SummaryCount,
  SummaryItem,
  SummaryTitle
} from '../styles';

type Props = {
  data: any;
  loading: boolean;
  isSmall?: boolean;
  type?: string;
};

class Summary extends React.Component<Props> {
  renderSummary(item, index) {
    if (typeof item === 'number') {
      return (
        <SummaryItem isSmall={this.props.isSmall} key={index}>
          <SummaryTitle>
            <span>
              {index === 3 ? '4 sec ++' : `${index} - ${index + 1} sec`}
            </span>
          </SummaryTitle>
          <SummaryCount>{item}</SummaryCount>
        </SummaryItem>
      );
    }

    return (
      <SummaryItem key={index}>
        <SummaryTitle id="summary-title">{item.title}</SummaryTitle>
        <SummaryCount>
          {item.count
            ? item.count.toLocaleString(undefined, {
                maximumFractionDigits: 2
              })
            : 0}
          {this.props.type && <span>{__('sec')}</span>}
        </SummaryCount>
      </SummaryItem>
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
