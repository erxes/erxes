import Button from "@erxes/ui/src/components/Button";
import dayjs from 'dayjs';
import { IPutResponse } from "../types";
import PerResponse from "./PerResponse";
import React from "react";
import Response from "./Response";
import _ from "lodash";
import client from "@erxes/ui/src/apolloClient";
import { formatValue } from "@erxes/ui/src/utils";
import { gql } from "@apollo/client";
import queries from "../graphql/queries";

type Props = {
  putResponse: IPutResponse;
  history: any;
  onReReturn: (_id: string) => void;
};

export const displayValue = (putResponse, name) => {
  const value = _.get(putResponse, name);
  return formatValue(value);
};

const PutResponseRow: React.FC<Props> = ({ putResponse, history, onReReturn }: Props) => {
  const onClick = () => {
    client
      .query({
        query: gql(queries.getDealLink),
        variables: { _id: putResponse.contentId },
      })
      .then((data) => {
        history.push(`${data.data.getDealLink}`);
      });
  };

  const onClickReReturn = () => {
    onReReturn(putResponse._id)
  }

  const onPrint = () => {
    const printContent = PerResponse(putResponse);
    const printMianContent = Response(printContent);
    const myWindow =
      window.open(`__`, "_blank", "width=800, height=800") || ({} as any);
    myWindow.document.write(printMianContent);
  };

  return (
    <tr key={putResponse._id}>
      <td key={'BillID'}>{putResponse.id} </td>
      <td key={"number"}>{putResponse.number} </td>
      <td key={'Date'}>
        {putResponse.date ||
          dayjs(putResponse.createdAt).format('YYYY-MM-DD HH:mm:ss')}
      </td>
      <td key={'success'}>{displayValue(putResponse, 'status')}</td>
      <td key={'billType'}>{displayValue(putResponse, 'type')}</td>
      <td key={'taxType'}>{displayValue(putResponse.receipts, 'length')}</td>
      <td key={'amount'}>{displayValue(putResponse, 'totalAmount')}</td>
      <td key={'message'}>{displayValue(putResponse, 'message')}</td>
      <td key={'inactiveId'}>{putResponse.inactiveId} </td>
      <td key={"actions"}>
        {(putResponse.contentType === "deal") && (
          <Button
            btnStyle="link"
            size="small"
            icon="external-link-alt"
            onClick={onClick}
          >
            Deal
          </Button>
        )}

        {(!putResponse.id && putResponse.inactiveId) && (
          <Button
            btnStyle="link"
            size="small"
            icon="repeat"
            onClick={onClickReReturn}
          >
            ReReturn
          </Button>
        )}

        {putResponse.id && (<Button
          btnStyle="link"
          size="small"
          icon="print"
          onClick={onPrint}
        >Print</Button>)}
      </td>
    </tr>
  );
};

export default PutResponseRow;
