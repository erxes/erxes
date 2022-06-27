import { __, FieldStyle, SidebarCounter, SidebarList } from '@erxes/ui/src';
import React from 'react';
import { IClientPortalUser } from '../../types';

type Props = {
  clientPortalUser: IClientPortalUser;
};

class DetailInfo extends React.Component<Props> {
  renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  render() {
    const { clientPortalUser } = this.props;

    return (
      <SidebarList className="no-link">
        {this.renderRow('First Name', clientPortalUser.firstName)}
        {this.renderRow('Last Name', clientPortalUser.lastName)}
        {this.renderRow('Code', clientPortalUser.code)}
        {this.renderRow('UserName', clientPortalUser.username)}
        {this.renderRow('Email', clientPortalUser.email)}
        {this.renderRow('Phone', clientPortalUser.phone)}
        {this.renderRow('ClientPortal Id', clientPortalUser.clientPortalId)}
      </SidebarList>
    );
  }
}

export default DetailInfo;
