import { Alert, __, confirm, formatValue } from "@erxes/ui/src/utils";
import { Button, SortHandler, Table } from "@erxes/ui/src/components";

import { IPutResponse } from "../types";
import { IRouterProps } from "@erxes/ui/src/types";
import PerResponse from "./PerResponse";
import React from "react";
import Response from "./Response";
import WithPermission from "coreui/withPermission";
import _ from "lodash";
import dayjs from "dayjs";
import { withRouter } from "react-router-dom";

export const displayValue = (putResponse, name) => {
  const value = _.get(putResponse, name);
  return formatValue(value);
};

interface IProps extends IRouterProps {
  putResponses: IPutResponse[];
  onReturnBill: (_id: string) => void;
}

type State = {};

class DetailDuplicated extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  onPrint = (putResponse: IPutResponse) => {
    const printContent = PerResponse(putResponse);
    const printMianContent = Response(printContent);
    const myWindow =
      window.open(`__`, "_blank", "width=800, height=800") || ({} as any);
    myWindow.document.write(printMianContent);
  };

  onReturn = (putResponse: IPutResponse) => {
    const { onReturnBill } = this.props;
    return confirm("This will permanently update are you absolutely sure?")
      .then(() => {
        onReturnBill(putResponse._id);
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  renderReturnBtn = (putResponse: IPutResponse) => {
    return (
      <WithPermission action="specialReturnBill">
        <Button
          btnStyle="link"
          size="small"
          icon="unlock-alt"
          onClick={this.onReturn.bind(this, putResponse)}
        ></Button>
      </WithPermission>
    );
  };

  render() {
    const { putResponses } = this.props;
    return (
      <Table
        $whiteSpace="nowrap"
        $bordered={true}
        $hover={true}
        $responsive={true}
      >
        <thead>
          <tr>
            <th>{__("BillID")} </th>
            <th>{__("Number")} </th>
            <th>{__("Date")} </th>
            <th>{__("Created")} </th>
            <th>{__("Modified")} </th>
            <th>{__("Resp")} </th>
            <th>{__("BillT")} </th>
            <th>{__("TaxT")} </th>
            <th>{__("Amount")} </th>
            <th>{__("Return BillID")}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="putResponses">
          {(putResponses || []).map((putResponse) => (
            <tr key={putResponse._id}>
              <td key={"BillID"}>{putResponse.billId} </td>
              <td key={"number"}>{putResponse.number} </td>
              <td key={"Date"}>
                {dayjs(
                  putResponse.date ||
                    putResponse.modifiedAt ||
                    putResponse.createdAt
                ).format("YYYY-MM-DD")}
              </td>
              <td key={"CreatedAt"}>
                {dayjs(putResponse.createdAt).format("HH:mm:ss SSS")}
              </td>
              <td key={"ModifiedAt"}>
                {dayjs(putResponse.modifiedAt).format("HH:mm:ss SSS")}
              </td>
              <td key={"success"}>{displayValue(putResponse, "success")}</td>
              <td key={"billType"}>{displayValue(putResponse, "billType")}</td>
              <td key={"taxType"}>{displayValue(putResponse, "taxType")}</td>
              <td key={"amount"}>{displayValue(putResponse, "amount")}</td>
              <td key={"ReturnBillId"}>
                {putResponse.sendInfo?.returnBillId}{" "}
              </td>
              <td key={"actions"}>
                <Button
                  btnStyle="link"
                  size="small"
                  icon="print"
                  onClick={this.onPrint.bind(this, putResponse)}
                ></Button>
                {this.renderReturnBtn(putResponse)}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }
}

export default withRouter<IRouterProps>(DetailDuplicated);
