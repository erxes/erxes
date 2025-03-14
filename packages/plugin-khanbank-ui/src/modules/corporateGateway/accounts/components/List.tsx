import * as routerUtils from "@erxes/ui/src/utils/router";

import { Description, SidebarListItem } from "@erxes/ui-settings/src/styles";
import { useLocation, useNavigate } from "react-router-dom";

import { FieldStyle } from "@erxes/ui/src/layout/styles";
import { IKhanbankAccount } from "../types";
import { Link } from "react-router-dom";
import React from "react";

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

        <SidebarListItem
          id={account.ibanAcctNo}
          key={account.ibanAcctNo}
          onClick={onClickRow}
          $isActive={queryParams.account === account.ibanAcctNo}
        >
          <Link to={`?_id=${props._id}&account=${account.ibanAcctNo}`}>
            <FieldStyle>
              Данс:{account.number}
              <br/>
              IBAN:{account.ibanAcctNo}
              <Description>{account.name}</Description>
            </FieldStyle>
          </Link>
          
        </SidebarListItem>
   
    </>
  ));
};

export default List;
