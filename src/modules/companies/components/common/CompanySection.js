import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Sidebar } from 'modules/layout/components';
import { ModalTrigger, Icon, Tip, EmptyState } from 'modules/common/components';
import { urlParser } from 'modules/common/utils';
import { CompanyChooser } from '../../containers';
import { SectionBody, SectionBodyItem } from 'modules/customers/styles';

const propTypes = {
  name: PropTypes.string,
  companies: PropTypes.array,
  onSelect: PropTypes.func
};

const defaultProps = {
  companies: []
};

function CompanySection({ name, companies, onSelect }, { __ }) {
  const { Section } = Sidebar;
  const { Title } = Sidebar.Section;

  const companyTrigger = (
    <a>
      <Icon erxes icon="add" />
    </a>
  );

  return (
    <Section>
      <Title>{__('Companies')}</Title>
      <Section.QuickButtons>
        <ModalTrigger title="Associate" trigger={companyTrigger} size="lg">
          <CompanyChooser data={{ name, companies }} onSelect={onSelect} />
        </ModalTrigger>
      </Section.QuickButtons>
      <SectionBody>
        {companies.map((company, index) => (
          <SectionBodyItem key={index}>
            <Link to={`/companies/details/${company._id}`}>
              <Icon erxes icon="logout-2" />
            </Link>
            <span>{company.name || 'N/A'}</span>
            <Tip text={company.website || ''}>
              <a target="_blank" href={`//${company.website}`}>
                {urlParser.extractRootDomain(company.website)}
              </a>
            </Tip>
          </SectionBodyItem>
        ))}
        {companies.length === 0 && (
          <EmptyState icon="briefcase" text="No company" />
        )}
      </SectionBody>
    </Section>
  );
}

CompanySection.propTypes = propTypes;
CompanySection.contextTypes = {
  __: PropTypes.func
};
CompanySection.defaultProps = defaultProps;

export default CompanySection;
