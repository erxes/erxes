import * as routerUtils from '@erxes/ui/src/utils/router';

import { Description, SidebarListItem } from '@erxes/ui-settings/src/styles';

import { FieldStyle } from '@erxes/ui/src/layout/styles';
// import { withRouter } from 'react-router-dom';
import { IKhanbankAccount } from '../types';
import { IRouterProps } from '@erxes/ui/src/types';
import { Link } from 'react-router-dom';
import React from 'react';
import WithPermission from 'coreui/withPermission';

type Props = {
  queryParams: any;
  configId: string;
  accounts: IKhanbankAccount[];
} & IRouterProps;

const List = (props: any) => {
  const { queryParams, accounts, history } = props;

  const onClickRow = (e) => {
    routerUtils.setParams(history, {
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
