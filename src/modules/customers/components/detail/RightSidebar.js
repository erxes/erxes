import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { PortableDeals } from 'modules/deals/containers';
import { CompanyAssociate } from 'modules/companies/containers';
import { List } from 'modules/companies/styles';

export default class RightSidebar extends React.Component {
  renderOther() {
    const { Section } = Sidebar;
    const { Title } = Section;

    const { __ } = this.context;
    const { customer } = this.props;
    const { name } = customer.integration || {};

    if (!name) {
      return null;
    }

    return (
      <Section>
        <Title>{__('Other')}</Title>

        <List>
          <li>
            <div>{__('Integration')}:</div>
            <span>{name}</span>
          </li>
        </List>
      </Section>
    );
  }

  render() {
    const { customer } = this.props;

    return (
      <Sidebar>
        <CompanyAssociate data={customer} />
        <PortableDeals customerId={customer._id} />
        {this.renderOther()}
      </Sidebar>
    );
  }
}

RightSidebar.propTypes = {
  customer: PropTypes.object.isRequired
};

RightSidebar.contextTypes = {
  __: PropTypes.func
};
