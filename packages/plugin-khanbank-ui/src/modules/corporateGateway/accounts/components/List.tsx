import * as routerUtils from "@erxes/ui/src/utils/router";

import { Description, SidebarListItem } from "@erxes/ui-settings/src/styles";

import { FieldStyle } from "@erxes/ui/src/layout/styles";
import { IKhanbankAccount } from "../types";
import { Link } from "react-router-dom";
import React from "react";
import WithPermission from "coreui/withPermission";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  configId: string;
  accounts: IKhanbankAccount[];
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

  return (accounts || []).map((account) => (
    <>
      <WithPermission action="khanbankAccounts">
        <SidebarListItem
          id={account.number}
          key={account.number}
          onClick={onClickRow}
          isActive={queryParams.account === account.number}
        >
          <Link to={`?_id=${props._id}&account=${account.number}`}>
            <FieldStyle>
              {account.number}
              <Description>{account.name}</Description>
            </FieldStyle>
          </Link>
        </SidebarListItem>
      </WithPermission>
    </>
  ));
};

export default List;
