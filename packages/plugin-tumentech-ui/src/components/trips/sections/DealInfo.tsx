import { IDeal } from '@erxes/ui-cards/src/deals/types';
import { FieldStyle, SidebarCounter, SidebarList } from '@erxes/ui/src';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { __, isEnabled } from '@erxes/ui/src/utils/core';
import * as path from 'path';
import React from 'react';

const CompanySection = asyncComponent(
  () =>
    isEnabled('contacts') &&
    path.resolve(
      /* webpackChunkName: "CompanySection" */ '@erxes/ui-contacts/src/companies/components/CompanySection'
    )
);

const CustomerSection = asyncComponent(
  () =>
    isEnabled('contacts') &&
    path.resolve(
      /* webpackChunkName: "CustomerSection" */ '@erxes/ui-contacts/src/customers/components/CustomerSection'
    )
);

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
        {isEnabled('contacts') && (
          <>
            <CustomerSection
              mainType="deal"
              mainTypeId={deal._id}
              isOpen={false}
            />
            <CompanySection
              mainType="deal"
              mainTypeId={deal._id}
              isOpen={false}
            />
          </>
        )}
      </SidebarList>
    );
  }
}

export default DetailInfo;
