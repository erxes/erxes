import { Sidebar } from '@erxes/ui/src';
import React from 'react';
import { IClientPortalUser } from '../../types';
import DetailInfo from './DetailInfo';
import Box from '@erxes/ui/src/components/Box';
import { List } from '../../styles';

type Props = {
  clientPortalUser: IClientPortalUser;
  history: any;
};

class LeftSidebar extends React.Component<Props> {
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
            <li onClick={onClick}>
              <div>
                {clientPortalUser.type === 'customer'
                  ? 'Customer Detail'
                  : 'Company Detail'}
                :{' '}
              </div>{' '}
              <span>
                {clientPortalUser.erxesCustomerId ||
                  clientPortalUser.erxesCompanyId}
              </span>
            </li>
          </List>
        </Box>
      </Sidebar>
    );
  }
}

export default LeftSidebar;
