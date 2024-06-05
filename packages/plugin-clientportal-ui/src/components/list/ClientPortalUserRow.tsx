import { FormControl } from "@erxes/ui/src/components/form";
import { IClientPortalUser } from "../../types";
import Icon from "@erxes/ui/src/components/Icon";
import Label from "@erxes/ui/src/components/Label";
import React from "react";
import Tip from "@erxes/ui/src/components/Tip";
import colors from "@erxes/ui/src/styles/colors";
import { formatValue } from "@erxes/ui/src/utils";
import { useNavigate } from "react-router-dom";
import { Flex } from "@erxes/ui/src/styles/main";
import { ClickableRow } from "@erxes/ui-contacts/src/customers/styles";

type Props = {
  index: number;
  clientPortalUser: IClientPortalUser;
  isChecked: boolean;
  toggleBulk: (
    clientPortalUser: IClientPortalUser,
    isChecked?: boolean
  ) => void;
};

const Row: React.FC<Props> = ({
  clientPortalUser,
  toggleBulk,
  isChecked,
  index,
}: Props) => {
  const navigate = useNavigate();

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(clientPortalUser, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    if (clientPortalUser.type === "customer") {
      return navigate(
        `/settings/client-portal/users/details/${clientPortalUser._id}`
      );
    }
    if (clientPortalUser.type === "company") {
      return navigate(
        `/settings/client-portal/companies/details/${clientPortalUser._id}`
      );
    }
  };

  const renderStatus = (verified: boolean) => {
    return (
      <Tip
        text={`Status: ${verified ? "verified" : "not verified"}`}
        placement="top"
      >
        <Icon
          icon={verified ? "shield-check" : "shield-slash"}
          color={verified ? colors.colorCoreGreen : colors.colorCoreGray}
        />
      </Tip>
    );
  };

  const {
    firstName,
    lastName,
    username,
    email,
    phone,
    createdAt,
    code,
    companyName,
    clientPortal,
    type,
  } = clientPortalUser;

  const verificationRequest = clientPortalUser.verificationRequest || {
    status: "notVerified",
  };

  let verificationStatus = "notVerified";

  switch (verificationRequest.status) {
    case "verified":
      verificationStatus = "verified";
      break;
    case "pending":
      verificationStatus = "pending";
      break;
    case "notVerified":
      verificationStatus = "not verified";
      break;
    default:
      verificationStatus = "not Verified";
      break;
  }

  const status = clientPortalUser.isOnline ? "online" : "offline";

  return (
    <tr onClick={onTrClick}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>
        <ClickableRow>{index.toString()}</ClickableRow>
      </td>
      <td>
        <ClickableRow>
          <Flex>
            {verificationStatus}&nbsp;
            {renderStatus(verificationStatus === "verified")}
          </Flex>
        </ClickableRow>
      </td>
      <td>
        <ClickableRow>
          <Flex>
            {email}&nbsp;{renderStatus(clientPortalUser.isEmailVerified)}
          </Flex>
        </ClickableRow>
      </td>
      <td>
        <ClickableRow>
          <Flex>
            {phone}&nbsp;{renderStatus(clientPortalUser.isPhoneVerified)}
          </Flex>
        </ClickableRow>
      </td>
      <td>
        <ClickableRow>{username}</ClickableRow>
      </td>
      <td>
        <ClickableRow>{code || "-"}</ClickableRow>
      </td>
      <td>
        <ClickableRow>{firstName || companyName}</ClickableRow>
      </td>
      <td>
        <ClickableRow>{lastName}</ClickableRow>
      </td>
      <td>
        <ClickableRow>{companyName || "-"}</ClickableRow>
      </td>
      <td>
        <ClickableRow>{type}</ClickableRow>
      </td>
      <td>
        <ClickableRow>{clientPortal ? clientPortal.name : "-"}</ClickableRow>
      </td>
      <td>
        <ClickableRow>
          <Label
            key={clientPortalUser._id}
            lblColor={
              clientPortalUser.isOnline
                ? colors.colorCoreGreen
                : colors.colorCoreGray
            }
            ignoreTrans={true}
          >
            <span>{status}</span>
          </Label>
        </ClickableRow>
      </td>
      <td>
        <ClickableRow>
          {formatValue(clientPortalUser.sessionCount || 0)}
        </ClickableRow>
      </td>
      <td>
        <ClickableRow>{formatValue(clientPortalUser.lastSeenAt)}</ClickableRow>
      </td>
      <td>
        <ClickableRow>{formatValue(createdAt)}</ClickableRow>
      </td>
      <td>
        <ClickableRow>{formatValue(clientPortalUser.modifiedAt)}</ClickableRow>
      </td>
    </tr>
  );
};

export default Row;
