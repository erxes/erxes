import * as React from "react";
import StyledTable from "./styles";

type Props = {
  children: React.ReactNode;
  striped?: boolean;
  bordered?: boolean;
  condensed?: boolean;
  hover?: boolean;
  responsive?: boolean;
  whiteSpace?: string;
  alignTop?: boolean;
} & Partial<DefaultProps>;

type DefaultProps = Readonly<typeof defaultProps>;

const defaultProps = {
  required: false,
  striped: false,
  bordered: false,
  condensed: false,
  hover: false,
  responsive: false,
  alignTop: false
};

class Table extends React.Component<Props> {
  static defaultProps = defaultProps;

  render() {
    return <StyledTable {...this.props} />;
  }
}

export default Table;
