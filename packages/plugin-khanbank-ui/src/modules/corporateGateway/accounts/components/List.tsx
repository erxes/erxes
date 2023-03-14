import { Description, SidebarListItem } from '@erxes/ui-settings/src/styles';
import { FieldStyle } from '@erxes/ui/src/layout/styles';
import { IRouterProps } from '@erxes/ui/src/types';
import * as routerUtils from '@erxes/ui/src/utils/router';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';

import { IKhanbankAccount } from '../types';

type Props = {
  queryParams: any;
  configId: string;
  accounts: IKhanbankAccount[];
} & IRouterProps;

const List = (props: any) => {
  const { queryParams, accounts, history } = props;

  const onClickRow = e => {
    routerUtils.setParams(history, {
      _id: props.configId,
      account: e.currentTarget.id
    });
  };

  return (accounts || []).map(account => (
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
  ));
};

export default withRouter<Props>(List);
