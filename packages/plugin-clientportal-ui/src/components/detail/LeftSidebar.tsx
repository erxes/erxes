import { Sidebar } from '@erxes/ui/src';
import Box from '@erxes/ui/src/components/Box';
import { LinkButton } from '@erxes/ui/src/styles/main';
import { renderFullName } from '@erxes/ui/src/utils/core';
import React from 'react';

import { List } from '../../styles';
import { IClientPortalUser } from '../../types';
import DetailInfo from './DetailInfo';

type Props = {
  clientPortalUser: IClientPortalUser;
  history: any;
};

class LeftSidebar extends React.Component<Props> {
  renderCustomer() {
    return renderFullName(this.props.clientPortalUser.customer);
  }

  renderCompany() {
    return renderFullName(this.props.clientPortalUser.company);
  }

  render() {
    const { clientPortalUser, history } = this.props;

    const onClick = () => {
      if (clientPortalUser.type === 'customer') {
        history.push(`/contacts/details/${clientPortalUser.erxesCustomerId}`);
      }
      if (clientPortalUser.type === 'company') {
        history.push(`/companies/details/${clientPortalUser.erxesCompanyId}`);
      }
    };

    return (
      <Sidebar wide={true}>
        <DetailInfo clientPortalUser={clientPortalUser} />

        <Box
          title={
            clientPortalUser.type === 'customer'
              ? 'Customer Detail'
              : 'Company Detail'
          }
          name="showOthers"
        >
          <List>
            <LinkButton onClick={onClick}>
              {clientPortalUser.erxesCustomerId
                ? this.renderCustomer()
                : this.renderCompany()}
            </LinkButton>
          </List>
        </Box>
      </Sidebar>
    );
  }
}

export default LeftSidebar;
