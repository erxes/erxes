import {
  FieldStyle,
  SidebarCounter,
  SidebarFlexRow,
  SidebarList,
} from "@erxes/ui/src/layout/styles";

import { GENDER_TYPES } from "../../constants";
import { ICustomer } from "../../types";
import { IField } from "@erxes/ui/src/types";
import { IFieldsVisibility } from "../../types";
import PrimaryEmail from "./PrimaryEmail";
import PrimaryPhone from "./PrimaryPhone";
import React from "react";
import { __ } from "@erxes/ui/src/utils";
import dayjs from "dayjs";

type Props = {
  customer: ICustomer;
  hasPosition?: boolean;
  fieldsVisibility: (key: string) => IFieldsVisibility;
  isDetail: boolean;
  fields: IField[];
  isGrid?: boolean;
};

class DetailInfo extends React.PureComponent<Props> {
  renderRow(field, value, type?) {
    const { fieldsVisibility, isDetail } = this.props;
    const isVisibleKey = isDetail ? "isVisibleInDetail" : "isVisible";
    const visibility = fieldsVisibility(isVisibleKey);

    if (!visibility[field]) return null;

    const label = visibility[field];

    if (type === "description") {
      return (
        <SidebarFlexRow>
          {__(`Description`)}:<span>{value || "-"}</span>
        </SidebarFlexRow>
      );
    }

    return (
      <li>
        <FieldStyle>{__(`${label}`)}:</FieldStyle>
        <SidebarCounter $fullLength={label === "Description"}>
          {value || "-"}
        </SidebarCounter>
      </li>
    );
  }

  renderEmail(status?: string, email?: string) {
    return (
      <li>
        <FieldStyle>{__("Primary Email")}:</FieldStyle>
        <SidebarCounter>
          <PrimaryEmail
            email={email}
            status={status}
            customerId={this.props.customer._id}
          />
        </SidebarCounter>
      </li>
    );
  }

  renderPhones(phone?: string) {
    return (
      <li>
        <FieldStyle>{__("Primary phone")}:</FieldStyle>
        <SidebarCounter>
          <PrimaryPhone phone={phone} />
        </SidebarCounter>
      </li>
    );
  }

  renderPosition(customer) {
    if (!this.props.hasPosition) {
      return null;
    }

    return this.renderRow("position", customer.position);
  }

renderPhoneList() {
  const { customer } = this.props;

  // Destructure `primaryPhone` and `phones` from the customer object
  let { primaryPhone, phones } = customer || {};

  // If there's a primaryPhone and phones list, prepend the primaryPhone to the array
  if (primaryPhone && phones?.length) {
    phones = [primaryPhone, ...phones]; // ensures primaryPhone shows first
  }

  // If there are no phone numbers, render a fallback UI showing "-"
  if (!phones?.length) {
    return (
      <li>
        <FieldStyle>{__("Phone Numbers")}:</FieldStyle>
        <SidebarCounter>-</SidebarCounter>
      </li>
    );
  }

  return (
    <li>
      <FieldStyle>{__("Phone Numbers")}:</FieldStyle>
      <SidebarCounter>
        <table style={{ width: "100%", borderSpacing: "0 6px" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", fontWeight: "bold" }}>{__("Number")}</th>
              <th style={{ textAlign: "left", fontWeight: "bold" }}>{__("Type")}</th>
            </tr>
          </thead>
          <tbody>
            {/* <tr>
              <td>{phones[0]?.phone || "-"}</td>
              <td>{__("primary")}</td>
            </tr>
            {phones[1] && (
              <tr>
                <td>{phones[1].phone || "-"}</td>
                <td>{__("mobile")}</td>
              </tr>
            )}
            {phones[2] && (
              <tr>
                <td>{phones[2].phone || "-"}</td>
                <td>{__("work")}</td>
              </tr>
            )} */}
            {
              phones.map(phone => (
                <tr>
                  <td>{phone || "-"}</td>
                  <td>{__("Other")}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </SidebarCounter>
    </li>
  );
}


  render() {
    const { customer, fields, isGrid } = this.props;

    if (!fields || !fields.length) {
      return null;
    }

    return (
      <SidebarList className="no-link" $isGrid={isGrid}>
        {this.renderRow("code", customer.code)}
        {this.renderEmail(
          customer.emailValidationStatus,
          customer.primaryEmail
        )}
        {this.renderPhoneList()}
        {this.renderPosition(customer)}
        {this.renderRow(
          "owner",
          customer.owner && customer.owner.details
            ? customer.owner.details.fullName
            : ""
        )}
        {this.renderRow("department", customer.department)}
        {this.renderRow("pronoun", GENDER_TYPES()[customer.sex || 0])}
        {this.renderRow(
          "birthDate",
          customer.birthDate && dayjs(customer.birthDate).format("MMM, DD YYYY")
        )}
        {this.renderRow("isSubscribed", customer.isSubscribed)}
        {this.renderRow("score", customer.score)}
        {this.renderRow("description", customer.description, "description")}
      </SidebarList>
    );
  }
}

export default DetailInfo;
