import {
  FieldStyle,
  SidebarCounter,
  SidebarFlexRow,
  SidebarList,
} from "@erxes/ui/src/layout/styles";

import { IField } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils";
import dayjs from "dayjs";
import React from "react";
import { GENDER_TYPES } from "../../constants";
import { InfoRow } from "../../styles";
import { ICustomer, IFieldsVisibility } from "../../types";
import PrimaryEmail from "./PrimaryEmail";
import PrimaryPhone from "./PrimaryPhone";

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

  renderPosition(customer) {
    if (!this.props.hasPosition) {
      return null;
    }

    return this.renderRow("position", customer.position);
  }

  renderPhones(
    status?: string,
    phones?: { phone: string; type: string; status?: string }[],
    primaryPhone?: string
  ) {
    const hasPrimaryPhone = (phones || []).find(
      (phone) => phone?.type === "primary"
    );

    if (!hasPrimaryPhone && primaryPhone) {
      phones = [{ phone: primaryPhone, type: "primary", status }, ...(phones || [])];
    }

    if (!phones?.length) {
      return (
        <li>
          <FieldStyle>{__("Phones")}</FieldStyle>
          <SidebarCounter>{__("-")}</SidebarCounter>
        </li>
      );
    }

    const renderPhone = ({ phone, type, status }: { phone?: string; type: string; status?: string }) => {
      const capitalizedType = type.replace(/^./, (char) => char.toUpperCase());

      return (
        <InfoRow key={`${type}-${phone}`}>
          <SidebarCounter>
            <PrimaryPhone
              phone={phone}
              status={status}
            />
          </SidebarCounter>
          <SidebarCounter>{capitalizedType}</SidebarCounter>
        </InfoRow>
      );
    };

    return (
      <li style={{ display: "flex", flexDirection: "column" }}>
        <InfoRow>
          <FieldStyle>{__("Phones")}</FieldStyle>
          <FieldStyle>{__("Type")}</FieldStyle>
        </InfoRow>
        {phones.map(renderPhone)}
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
        {this.renderPhones(
          customer.phoneValidationStatus,
          customer.phones,
          customer.primaryPhone
        )}
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
