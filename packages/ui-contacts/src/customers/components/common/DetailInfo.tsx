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

  renderPosition(customer) {
    if (!this.props.hasPosition) {
      return null;
    }

    return this.renderRow("position", customer.position);
  }

  renderContactInfo(
    contactType: "phone" | "email",
    items: any[] | undefined,
    customerId?: string
  ) {
    const label = contactType?.replace(/^./, (c) => c.toUpperCase()) + "s";

    if (!items?.length) {
      return (
        <li>
          <FieldStyle>{__(label)}</FieldStyle>
          <SidebarCounter>{__("-")}</SidebarCounter>
        </li>
      );
    }

    const FieldComponents = {
      phone: PrimaryPhone,
      email: PrimaryEmail,
    };

    const renderItem = (item: any) => {
      if (!item) {
        return <></>;
      }

      const { [contactType]: value, type, status } = item || {};

      const itemType = type?.replace(/^./, (c) => c.toUpperCase());

      const InfoComponent = FieldComponents[contactType];

      const infoProps = {
        [contactType]: value,
        status,
        customerId: customerId!,
      };

      return (
        <InfoRow key={`${type}-${value}`}>
          <SidebarCounter>
            <InfoComponent {...infoProps} />
          </SidebarCounter>
          <SidebarCounter>{itemType}</SidebarCounter>
        </InfoRow>
      );
    };

    return (
      <li style={{ display: "flex", flexDirection: "column" }}>
        <InfoRow>
          <FieldStyle>{__(label)}</FieldStyle>
          <FieldStyle>{__("Type")}</FieldStyle>
        </InfoRow>
        {items.map(renderItem)}
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
        {this.renderContactInfo("phone", customer.phones)}
        {this.renderContactInfo("email", customer.emails, customer._id)}
        {this.renderRow("code", customer.code)}
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
