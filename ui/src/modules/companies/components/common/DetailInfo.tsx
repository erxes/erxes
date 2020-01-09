import { __ } from 'modules/common/utils';
import {
  LEAD_STATUS_TYPES,
  LIFECYCLE_STATE_TYPES
} from 'modules/customers/constants';
import {
  FieldStyle,
  SidebarCounter,
  SidebarFlexRow,
  SidebarList
} from 'modules/layout/styles';
import React from 'react';
import { ICompany } from '../../types';

type Props = {
  company: ICompany;
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
    const { company } = this.props;

    return (
      <SidebarList className="no-link">
        {this.renderRow('Size', company.size)}
        {this.renderRow('Industry', company.industry)}
        {this.renderRow(
          'Parent Company',
          company.parentCompany ? company.parentCompany.primaryName : '-'
        )}
        {this.renderRow('Email', company.primaryEmail)}
        {this.renderRow(
          'Owner',
          company.owner && company.owner.details
            ? company.owner.details.fullName
            : '-'
        )}
        {this.renderRow('Phone', company.primaryPhone)}
        {this.renderRow(
          'Pop Ups Status',
          LEAD_STATUS_TYPES[company.leadStatus || '']
        )}
        {this.renderRow(
          'Lifecycle State',
          LIFECYCLE_STATE_TYPES[company.lifecycleState || '']
        )}
        {this.renderRow('Business Type', company.businessType)}
        {this.renderRow('Do not disturb', company.doNotDisturb)}
        <SidebarFlexRow>
          {__(`Description`)}:<span>{company.description || '-'}</span>
        </SidebarFlexRow>
      </SidebarList>
    );
  }
}

export default DetailInfo;
