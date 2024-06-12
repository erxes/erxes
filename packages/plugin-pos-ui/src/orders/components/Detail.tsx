import * as dayjs from "dayjs";

import { DetailRow, FinanceAmount, FlexRow } from "../../styles";
import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
  Table,
  __,
} from "@erxes/ui/src";
import React, { useState } from "react";

import { Alert } from "@erxes/ui/src/utils";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import { ICustomer } from "@erxes/ui-contacts/src/customers/types";
import { IOrderDet } from "../types";
import { IPos } from "../../types";
import { Link } from "react-router-dom";
import _ from "lodash";

type Props = {
  order: IOrderDet;
  onChangePayments?: (
    _id: string,
    cashAmount: number,
    mobileAmount: number,
    paidAmounts: any[]
  ) => void;
  pos?: IPos;
};

const Detail = (props: Props) => {
  const { order, pos, onChangePayments } = props;

  const initialPaidAmounts = () => {
    const amounts = [...order.paidAmounts] || [];
    const paidKeys = amounts.map((pa) => pa.type);

    for (const emptyType of (pos?.paymentTypes || []).filter(
      (pt) => !paidKeys.includes(pt.type)
    )) {
      amounts.push({
        _id: Math.random().toString(),
        amount: 0,
        type: emptyType.type,
      });
    }

    return amounts;
  };

  const [state, setState] = useState({
    paidAmounts: initialPaidAmounts(),
    cashAmount: order.cashAmount,
    mobileAmount: order.mobileAmount,
  });

  const displayValue = (order, name) => {
    const value = _.get(order, name);
    return <FinanceAmount>{(value || 0).toLocaleString()}</FinanceAmount>;
  };

  const renderRow = (label, value) => {
    return (
      <li>
        <FlexRow>
          <FieldStyle>{__(`${label}`)}:</FieldStyle>
          <SidebarCounter>{value || "-"}</SidebarCounter>
        </FlexRow>
      </li>
    );
  };

  const renderEditRow = (label, key) => {
    const value = state[key];
    const onChangeValue = (e) => {
      setState({ [key]: Number(e.target.value) } as any);
    };
    return (
      <li>
        <FlexRow>
          <FieldStyle>{__(`${label}`)}:</FieldStyle>
          <FormControl type="number" onChange={onChangeValue} value={value} />
        </FlexRow>
      </li>
    );
  };

  const onChangePaidAmount = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setState((prevState) => ({
      ...prevState,
      paidAmounts: prevState.paidAmounts.map((pa) =>
        pa._id === name ? { ...pa, amount: value } : pa
      ),
    }));
  };

  const renderEditPaid = () => {
    return state.paidAmounts.map((paidAmount) => {
      const { paymentTypes } = pos || {};

      return (
        <li key={paidAmount._id}>
          <FlexRow key={paidAmount._id}>
            <FieldStyle>
              {__(
                `${
                  (
                    (paymentTypes || []).find(
                      (pt) => pt.type === paidAmount.type
                    ) || {}
                  ).title || paidAmount.type
                }`
              )}
              :
            </FieldStyle>
            <FormControl
              type="number"
              name={paidAmount._id}
              onChange={onChangePaidAmount}
              value={paidAmount.amount || 0}
            />
          </FlexRow>
        </li>
      );
    });
  };

  const renderDescription = () => {
    const { description } = order;
    if (!description) {
      return <></>;
    }

    return renderRow("Delivery info", description);
  };

  const save = () => {
    const { totalAmount } = order;
    const { paidAmounts, cashAmount, mobileAmount } = state;

    if (
      cashAmount +
        mobileAmount +
        (paidAmounts || []).reduce(
          (sum, i) => Number(sum) + Number(i.amount),
          0
        ) !==
      totalAmount
    ) {
      Alert.error("Is not balanced");
      return;
    }

    onChangePayments &&
      onChangePayments(
        order._id,
        cashAmount,
        mobileAmount,
        (paidAmounts || []).filter((pa) => Number(pa.amount) !== 0)
      );
  };

  const generateLabel = (customer) => {
    const { firstName, primaryEmail, primaryPhone, lastName } =
      customer || ({} as ICustomer);

    let value = firstName ? firstName.toUpperCase() : "";

    if (lastName) {
      value = `${value} ${lastName}`;
    }
    if (primaryPhone) {
      value = `${value} (${primaryPhone})`;
    }
    if (primaryEmail) {
      value = `${value} /${primaryEmail}/`;
    }

    return value;
  };

  const renderReturnInfo = () => {
    if (!order.returnInfo || !order.returnInfo.returnAt) {
      return <></>;
    }

    return renderRow(
      "return Date",
      dayjs(order.returnInfo.returnAt).format("lll")
    );
  };

  return (
    <SidebarList>
      {renderRow(
        `${(order.customerType || "Customer").toLocaleUpperCase()}`,
        order.customer ? generateLabel(order.customer) : ""
      )}
      {renderRow("Bill Number", order.number)}
      {renderRow(
        "Date",
        dayjs(order.paidDate || order.createdAt).format("lll")
      )}
      {renderDescription()}
      {order.syncErkhetInfo
        ? renderRow("Erkhet Info", order.syncErkhetInfo)
        : ""}

      {order.convertDealId
        ? renderRow(
            "Deal",
            <Link to={order.dealLink || ""}>{order.deal?.name || "deal"}</Link>
          )
        : ""}
      <>
        {(order.putResponses || []).map((p) => {
          return (
            <DetailRow key={Math.random()}>
              {renderRow("Bill ID", p.billId)}
              {renderRow("Ebarimt Date", dayjs(p.date).format("lll"))}
            </DetailRow>
          );
        })}
      </>

      <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
        <thead>
          <tr>
            <th>{__("Product")}</th>
            <th>{__("Count")}</th>
            <th>{__("Unit Price")}</th>
            <th>{__("Amount")}</th>
            <th>{__("Diff")}</th>
          </tr>
        </thead>
        <tbody id="orderItems">
          {(order.items || []).map((item) => (
            <tr key={item._id}>
              <td>{item.productName}</td>
              <td>{item.count}</td>
              <td>{item.unitPrice}</td>
              <td>{item.count * item.unitPrice}</td>
              <td>{item.discountAmount}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {renderRow("Total Amount", displayValue(order, "totalAmount"))}
      {renderReturnInfo()}
      {pos && (
        <ul>
          {renderEditRow("Cash Amount", "cashAmount")}
          {renderEditRow("Mobile Amount", "mobileAmount")}
          {renderEditPaid()}
        </ul>
      )}

      <Button btnStyle="success" size="small" onClick={save} icon="edit">
        Save Payments Change
      </Button>
    </SidebarList>
  );
};

export default Detail;
