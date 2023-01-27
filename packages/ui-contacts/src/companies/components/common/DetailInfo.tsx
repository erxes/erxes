import {
  FieldStyle,
  SidebarCounter,
  SidebarFlexRow,
  SidebarList
} from '@erxes/ui/src/layout/styles';

import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  company: ICompany;
};

class DetailInfo extends React.Component<Props> {
  renderRow = (label, value) => {
    const className = label === 'Industry' ? 'multiple-choice' : '';

    return (
      <li className={className}>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  renderDescription(description?: string) {
    return (
      <SidebarFlexRow>
        {__(`Description`)}:<span>{description || '-'}</span>
      </SidebarFlexRow>
    );
  }

  render() {
    const { company = {} as ICompany } = this.props;

    return (
      <SidebarList className="no-link">
        {this.renderRow('Code', company.code)}
        {this.renderRow('Size', company.size)}
        {this.renderRow('Industry', company.industry)}
        {this.renderRow('Parent Company', company.parentCompany?.primaryName)}
        {this.renderRow('Primary Email', company.primaryEmail)}
        {this.renderRow('Owner', company.owner?.details?.fullName)}
        {this.renderRow('Primary Phone', company.primaryPhone)}
        {this.renderRow('Location', company.location)}
        {this.renderRow('Business Type', company.businessType)}
        {this.renderRow('Subscribed', company.isSubscribed)}
        {this.renderRow('Score', company.score)}
        {this.renderDescription(company.description)}
      </SidebarList>
    );
  }
}

export default DetailInfo;
