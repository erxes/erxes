import { __ } from 'modules/common/utils';
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
        {this.renderRow('Code', company.code)}
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
