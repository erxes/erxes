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

  renderFields = type => {
    const { clientPortalUser } = this.props;

    if (type === 'customer') {
      return (
        <>
          {this.renderRow('First Name', clientPortalUser.firstName)}
          {this.renderRow('Last Name', clientPortalUser.lastName)}
          {this.renderRow('UserName', clientPortalUser.username)}
        </>
      );
    }

    if (type === 'company') {
      return (
        <>
          {this.renderRow('Company Name', clientPortalUser.companyName)}
          {this.renderRow(
            'Company Registration Number',
            clientPortalUser.companyRegistrationNumber
          )}
        </>
      );
    }
  };

  render() {
    const { clientPortalUser } = this.props;

    return (
      <SidebarList className="no-link">
        {this.renderFields(clientPortalUser.type)}
        {this.renderRow('Code', clientPortalUser.code)}
        {this.renderRow('Email', clientPortalUser.email)}
        {this.renderRow('Phone', clientPortalUser.phone)}
        {this.renderRow('Client Portal', clientPortalUser.clientPortal.name)}
      </SidebarList>
    );
  }
}

export default DetailInfo;
