import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { createStore } from "redux";
import { Provider } from "react-redux";
import reducer from "./reducers/index";
import Row from "./row";
import Cell from "./cell";
import Thead, { ThCell } from "./thead";
import Tfoot, { TfCell } from "./tfoot";

const TableStyled = styled.table`
  display: table;
  padding: 0;
  border-collapse: collapse;
  width: 100%;
  text-size-adjust: 100%;
  text-align: left;
`;
const TbodyStyled = styled.tbody``;
const store = createStore(reducer);

export default class Table extends React.Component {
  componentDidUpdate() {
    if (this.props.striped) {
      store.dispatch({ type: "striped-on" });
    } else {
      store.dispatch({ type: "striped-off" });
    }
    if (this.props.hover) {
      store.dispatch({ type: "hover-on" });
    } else {
      store.dispatch({ type: "hover-off" });
    }
  }

  render() {
    return (
      <Provider store={store}>
        <TableStyled
          striped={store.getState().striped}
          hover={store.getState().hover}
        >
          {this.props.children}
        </TableStyled>
      </Provider>
    );
  }
}

const Tbody = ({ children }) => {
  return <TbodyStyled>{children}</TbodyStyled>;
};

Tbody.propTypes = {
  children: PropTypes.node
};

Table.propTypes = {
  children: PropTypes.node,
  striped: PropTypes.bool,
  hover: PropTypes.bool
};
Table.defaultProps = {
  hover: false,
  striped: false
};
export { Thead, Tbody, Tfoot, Row, Cell, ThCell, TfCell };
