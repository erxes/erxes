import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Sidebar } from 'modules/layout/components';
import { ModalTrigger, Icon, Tip, EmptyState } from 'modules/common/components';
import { urlParser } from 'modules/common/utils';
import { CompanyAssociate } from 'modules/companies/containers';
import { CompanyWrapper } from './styles';

const propTypes = {
  customer: PropTypes.object.isRequired
};

function CompanySection({ customer }, { __ }) {
  const { Section } = Sidebar;
  const { Title } = Sidebar.Section;
  const companies = customer.companies || [];

  const companyTrigger = (
    <a>
      <Icon icon="plus" />
    </a>
  );

  return (
    <Section>
      <Title>{__('Companies')}</Title>
      <Section.QuickButtons>
        <ModalTrigger title="Associate" trigger={companyTrigger} size="lg">
          <CompanyAssociate data={customer} />
        </ModalTrigger>
      </Section.QuickButtons>
      {companies.map((company, index) => (
        <CompanyWrapper key={index}>
          <Link to={`/companies/details/${company._id}`}>
            <Icon icon="android-open" />
          </Link>
          <div>{company.name || 'N/A'}</div>
          <Tip text={company.website || ''}>
            <a target="_blank" href={`//${company.website}`}>
              {urlParser.extractRootDomain(company.website)}
            </a>
          </Tip>
        </CompanyWrapper>
      ))}

      {companies.length === 0 && (
        <EmptyState icon="briefcase" text="No company" />
      )}
    </Section>
  );
}

CompanySection.propTypes = propTypes;
CompanySection.contextTypes = {
  __: PropTypes.func
};

export default CompanySection;
