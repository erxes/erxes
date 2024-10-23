import { ActionButtons, Button, Icon, Tip } from "@erxes/ui/src/components";
import { __, renderUserFullName } from "@erxes/ui/src/utils/core";

import { DateWrapper } from "@erxes/ui/src/styles/main";
import { FormControl } from "@erxes/ui/src/components/form";
import { IInvoice } from "../../types";
import Label from "@erxes/ui/src/components/Label";
import { PAYMENTCONFIGS } from "../constants";
import React from "react";
import dayjs from "dayjs";
import { renderFullName } from "@erxes/ui/src/utils";

type Props = {
  invoice: IInvoice;
  isChecked: boolean;
  onClick: (invoiceId: string) => void;
  toggleBulk: (invoice: IInvoice, isChecked?: boolean) => void;
  check: (invoiceId: string) => void;
};

const Row: React.FC<Props> = (props) => {
  const { invoice, toggleBulk, isChecked, check } = props;

  const renderCheckAction = () => {
    const onClick = () => check(invoice._id);

    return (
      <Tip text={__("Check invoice")} placement="top">
        <Button
          id="checkInvoice"
          btnStyle="link"
          onClick={onClick}
          icon="invoice"
        />
      </Tip>
    );
  };

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(invoice, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
    props.onClick(invoice._id);
  };

  const onTrClick = (e) => {
    if (e.target.className.includes("icon-invoice")) {
      return;
    }

    e.stopPropagation();
    props.onClick(invoice._id);
  };

  const {
    payment,
    amount,
    description,
    createdAt,
    resolvedAt,
    customer,
    customerType,
    status,
  } = invoice;

  let labelStyle = "danger";

  switch (status) {
    case "paid":
      labelStyle = "success";
      break;
    case "pending":
      labelStyle = "warning";
      break;
    default:
      labelStyle = "danger";
  }

  const renderCustomerName = () => {
    if (!customer) {
      return "-";
    }

    if (customerType === "user") {
      return renderUserFullName(customer);
    }

    if (customerType === "company") {
      return customer.primaryName || customer.website || "-";
    }

    return renderFullName(customer);
  };



  return (
    <tr onClick={onTrClick}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{invoice.invoiceNumber || 'NA'}</td>
      <td>{amount.toLocaleString() + " " + invoice.currency}</td>
      <td>
        <Label lblStyle={labelStyle}>{status}</Label>
      </td>
      <td>{renderCustomerName()}</td>
      <td>{customerType}</td>
      <td>{description}</td>
      <td>
        <Icon icon="calender" />{" "}
        <DateWrapper>{dayjs(createdAt).format("lll")}</DateWrapper>
      </td>
      <td>
        <Icon icon="calender" />{" "}
        {resolvedAt ? (
          <DateWrapper>{dayjs(resolvedAt).format("lll")}</DateWrapper>
        ) : (
          "--- --, ----"
        )}
      </td>
      <td>
        <ActionButtons>
          {invoice.status === "pending" && renderCheckAction()}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
