import { __ } from 'modules/common/utils';
import {
  FieldStyle,
  SidebarCounter,
  SidebarFlexRow,
  SidebarList
} from 'modules/layout/styles';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import { ICompany } from '../../types';

type Props = {
  company: ICompany;
  fields: IField[];
};

class DetailInfo extends React.Component<Props> {
  renderRow = (field, value) => {
    const { fields } = this.props;

    const property = fields.find(e => e.type === field);

    if (property && !property.isVisible) {
      return null;
    }

    const label = property && property.text;

    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  renderParentCompany(parentCompany?: string) {
    return (
      <li>
        <FieldStyle>{__('Parent company')}:</FieldStyle>
        <SidebarCounter>{parentCompany || '-'}</SidebarCounter>
      </li>
    );
  }

  renderDescription(description?: string) {
    const { fields } = this.props;

    const descriptionField = fields.find(e => e.type === 'description');

    if (descriptionField && !descriptionField.isVisible) {
      return null;
    }

    return (
      <SidebarFlexRow>
        {descriptionField && descriptionField.isVisible}
        {__(`Description`)}:<span>{description || '-'}</span>
      </SidebarFlexRow>
    );
  }

  render() {
    const { company } = this.props;

    return (
      <SidebarList className="no-link">
        {this.renderRow('code', company.code)}
        {this.renderRow('size', company.size)}
        {this.renderRow('industry', company.industry)}
        {this.renderParentCompany(
          company.parentCompany ? company.parentCompany.primaryName : '-'
        )}
        {this.renderRow('primaryEmail', company.primaryEmail)}
        {this.renderRow(
          'owner',
          company.owner && company.owner.details
            ? company.owner.details.fullName
            : '-'
        )}
        {this.renderRow('primaryPhone', company.primaryPhone)}
        {this.renderRow('businessType', company.businessType)}
        {this.renderRow('doNotDisturb', company.doNotDisturb)}
        {this.renderDescription(company.description)}
      </SidebarList>
    );
  }
}

export default DetailInfo;
