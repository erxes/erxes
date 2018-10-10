import * as React from 'react';
import StyledTable from './styles';

type Props = {
  children: React.ReactNode;
  striped?: boolean;
  bordered?: boolean;
  condensed?: boolean;
  hover?: boolean;
  responsive?: boolean;
  whiteSpace?: string;
  alignTop?: boolean;
};

class Table extends React.Component<Props> {
  static defaultProps = {
    alignTop: false,
    bordered: false,
    condensed: false,
    hover: false,
    required: false,
    responsive: false,
    striped: false
  };

  render() {
    return <StyledTable {...this.props} />;
  }
}

export default Table;
