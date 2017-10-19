import React from "react";
import { storiesOf } from "@storybook/react";
import { withKnobs, boolean } from "@storybook/addon-knobs";

import Table, {
  Tbody,
  Row,
  Cell,
  Thead,
  ThCell,
  Tfoot,
  TfCell
} from "../src/components/Table";

storiesOf("Table", module)
  .addDecorator(withKnobs)
  .add("Table", () => (
    <Table hover={boolean("hover", false)} striped={boolean("striped", false)}>
      <Thead>
        <Row>
          <ThCell>THEAD1</ThCell>
          <ThCell>THEAD2</ThCell>
          <ThCell>THEAD2</ThCell>
          <ThCell>THEAD2</ThCell>
        </Row>
      </Thead>
      <Tbody>
        <Row>
          <Cell>d1</Cell>
          <Cell>d1</Cell>
          <Cell>d1</Cell>
          <Cell>d1</Cell>
        </Row>
        <Row>
          <Cell>d2</Cell>
          <Cell>d2</Cell>
          <Cell>d2</Cell>
          <Cell>d2</Cell>
        </Row>
      </Tbody>
      <Tfoot>
        <Row>
          <TfCell>TFOOT1</TfCell>
          <TfCell>TFOOT1</TfCell>
          <TfCell>TFOOT1</TfCell>
          <TfCell>TFOOT1</TfCell>
        </Row>
      </Tfoot>
    </Table>
  ));
