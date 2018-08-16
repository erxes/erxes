import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { CustomerAssociate } from 'modules/customers/containers';
import { PortableDeals } from 'modules/deals/containers';
import { List } from '../../styles';

const propTypes = {
  company: PropTypes.object.isRequired
};

export default class RightSidebar extends React.Component {
  renderPlan(company) {
    const { __ } = this.context;

    if (!company.plan) {
      return null;
    }

    return (
      <li>
        <div>{__('Plan')}: </div>
        <span>{company.plan}</span>
      </li>
    );
  }

  render() {
    const { company } = this.props;
    const { __ } = this.context;

    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Sidebar>
        <CustomerAssociate data={company} />
        <PortableDeals companyId={company._id} />

        <Section>
          <Title>{__('Other')}</Title>
          <List>
            <li>
              <div>{__('Created at')}: </div>{' '}
              <span>{moment(company.createdAt).format('lll')}</span>
            </li>
            <li>
              <div>{__('Modified at')}: </div>{' '}
              <span>{moment(company.modifiedAt).format('lll')}</span>
            </li>
            {this.renderPlan(company)}
          </List>
        </Section>
      </Sidebar>
    );
  }
}

RightSidebar.propTypes = propTypes;
RightSidebar.contextTypes = {
  __: PropTypes.func
};
