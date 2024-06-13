import * as routerUtils from "@erxes/ui/src/utils/router";
import { Description, SidebarListItem } from "@erxes/ui-settings/src/styles";
import { FieldStyle } from "@erxes/ui/src/layout/styles";

import { Link, useNavigate } from "react-router-dom";
import React from "react";

export default function AccountRow({
  account,
  configId,
  queryParams,
  _id,
}: any) {
  const navigate = useNavigate();
  const onClickRow = (e) => {
    routerUtils.setParams(navigate, location, {
      _id: configId,
      account: e.currentTarget.id,
    });
  };

  return (
    <SidebarListItem
      id={account.accountId}
      key={account.accountId}
      onClick={onClickRow}
      $isActive={queryParams.account === account.accountId}
      style={{ overflow: "auto" }}
    >
      <Link to={`?_id=${_id}&account=${account.number}`}>
        <FieldStyle>
          {account.accountId}
          <Description>{account.accountName}</Description>
        </FieldStyle>
      </Link>
    </SidebarListItem>
  );
}
