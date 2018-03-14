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

function CompaniySection({ customer }, { __ }) {
  const { Section } = Sidebar;
  const { Title } = Sidebar.Section;

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
      {customer.companies.map((company, index) => (
        <CompanyWrapper key={index}>
          <Link to={`/companies/details/${company._id}`}>
            <Icon icon="android-open" />
          </Link>
          <div>{company.name || 'N/A'}</div>
          <Tip text={company.website || ''}>
            <span>
              <a target="_blank" href={`//${company.website}`}>
                {urlParser.extractRootDomain(company.website)}
              </a>
            </span>
          </Tip>
        </CompanyWrapper>
      ))}

      {customer.companies.length === 0 && (
        <EmptyState icon="briefcase" text="No company" />
      )}
    </Section>
  );
}

CompaniySection.propTypes = propTypes;
CompaniySection.contextTypes = {
  __: PropTypes.func
};

export default CompaniySection;
