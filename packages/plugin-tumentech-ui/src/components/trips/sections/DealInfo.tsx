import { IDeal } from '@erxes/ui-cards/src/deals/types';
import {
  __,
  FieldStyle,
  SidebarCounter,
  SidebarList,
  CustomerSection,
  CompanySection
} from '@erxes/ui/src';
import React from 'react';

type Props = {
  deal: IDeal;
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
    const { deal } = this.props;

    return (
      <SidebarList className="no-link">
        {this.renderRow('Deal name', deal.name)}
        {/* {this.renderRow(')} */}
        <CustomerSection mainType="deal" mainTypeId={deal._id} isOpen={false} />
        <CompanySection mainType="deal" mainTypeId={deal._id} isOpen={false} />
      </SidebarList>
    );
  }
}

export default DetailInfo;
