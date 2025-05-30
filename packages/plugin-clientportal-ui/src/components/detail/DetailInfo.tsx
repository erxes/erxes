import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from "@erxes/ui/src/layout/styles";

import { IClientPortalUser } from "../../types";
import React from "react";
import { __ } from "@erxes/ui/src/utils/core";
import dayjs from "dayjs";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Props = {
  clientPortalUser: IClientPortalUser;
};

const DetailInfo: React.FC<Props> = ({ clientPortalUser }: Props) => {
  const renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || "-"}</SidebarCounter>
      </li>
    );
  };

  const renderFields = (type) => {
    if (type === "customer") {
      return (
        <>
          {renderRow("First Name", clientPortalUser.firstName)}
          {renderRow("Last Name", clientPortalUser.lastName)}
          {renderRow("UserName", clientPortalUser.username)}
        </>
      );
    }

    if (type === "company") {
      return (
        <>
          {renderRow("Company Name", clientPortalUser.companyName)}
          {renderRow(
            "Company Registration Number",
            clientPortalUser.companyRegistrationNumber
          )}
        </>
      );
    }
  };

  const renderCustomFields = () => {
    const customFieldsData = clientPortalUser.customFieldsData || [];
    const customData = customFieldsData as unknown as Array<{
      field: string;
      value: string;
    }>;

    if (!customData || customData.length === 0) return null;

    return customData.map((data) => renderRow(data.field, data.value));
  };

  return (
    <SidebarList className="no-link">
      {renderFields(clientPortalUser.type)}
      {renderRow("Code", clientPortalUser.code)}
      {renderRow("Email", clientPortalUser.email)}
      {renderRow("Phone", clientPortalUser.phone)}
      {renderRow("Business Portal", clientPortalUser.clientPortal.name)}
      {renderCustomFields()}
      {isEnabled("forum") &&
        renderRow(
          "Subscription ends after",
          dayjs(clientPortalUser.forumSubscriptionEndsAfter).format("lll")
        )}
    </SidebarList>
  );
};

export default DetailInfo;
