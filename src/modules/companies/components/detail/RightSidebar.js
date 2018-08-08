import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SectionBody, SectionBodyItem } from 'modules/layout/styles';
import { CustomerAssociate } from 'modules/customers/containers';
import { DealSection } from 'modules/deals/containers';

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
      <SectionBodyItem>
        <span>{__('Plan')}: </span> {company.plan}
      </SectionBodyItem>
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
        <DealSection companyId={company._id} />

        <Section>
          <Title>{__('Other')}</Title>
          <SectionBody>
            <SectionBodyItem>
              <span>{__('Created at')}: </span>{' '}
              {moment(company.createdAt).fromNow()}
            </SectionBodyItem>
            <SectionBodyItem>
              <span>{__('Modified at')}: </span>{' '}
              {moment(company.modifiedAt).fromNow()}
            </SectionBodyItem>
            {this.renderPlan(company)}
          </SectionBody>
        </Section>
      </Sidebar>
    );
  }
}

RightSidebar.propTypes = propTypes;
RightSidebar.contextTypes = {
  __: PropTypes.func
};
