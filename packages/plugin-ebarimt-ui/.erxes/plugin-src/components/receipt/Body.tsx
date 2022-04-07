import React from "react";
import { __ } from '@erxes/ui/src/utils';

type Props = {
  items: any[];
};

export default class ReceiptBody extends React.Component<Props> {
  renderItem(item) {
    return (
      <tr key={Math.random()} className="detail-row">
        <td>{item.name}</td>
        <td>
          {item.unitPrice.toLocaleString()} x{item.qty}
        </td>
        <td className="totalCount">
          {" "}
          = <b>{item.totalAmount.toLocaleString()}</b>
        </td>
      </tr>
    );
  }

  render() {
    return (
      <table className="block">
        <thead>
          <tr className="detail-row">
            <th>{__("Inventory")}</th>
            <th>{__("Price")}/{__("Count")}</th>
            <th className="totalCount">{__("Total amount")}</th>
          </tr>
        </thead>
        <tbody>{(this.props.items || []).map((item) => this.renderItem(item))}</tbody>
      </table>
    );
  }
}
