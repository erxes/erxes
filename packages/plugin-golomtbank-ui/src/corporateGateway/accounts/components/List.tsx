import * as routerUtils from "@erxes/ui/src/utils/router";
import { Description, SidebarListItem } from "@erxes/ui-settings/src/styles";
import { FieldStyle } from "@erxes/ui/src/layout/styles";
import { IGolomtBankAccount } from "../../../types/IGolomtAccount";
import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Sidebar } from "@erxes/ui/src";

type Props = {
  _id: string
  queryParams: any;
  configId: string;
  accounts: IGolomtBankAccount[];
};

const List = (props: any) => {
  const { queryParams, accounts } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const onClickRow = (e) => {
    routerUtils.setParams(navigate, location, {
      _id: props.configId,
      account: e.currentTarget.id,
    });
  };

  return (
    <Sidebar>
      {(accounts || []).map((account) => (
        <SidebarListItem
          id={account.accountId}
          key={account.accountId}
          onClick={onClickRow}
          $isActive={queryParams.account === account.accountId}
          style={{ overflow: "auto" }}
        >
          <Link to={`?_id=${props._id}&account=${account.number}`}>
            <FieldStyle>
              {account.accountId}
              <Description>{account.accountName}</Description>
            </FieldStyle>
          </Link>
        </SidebarListItem>
      ))}
    </Sidebar>
  );
};

export default List;
