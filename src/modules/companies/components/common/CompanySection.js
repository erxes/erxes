import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Sidebar } from 'modules/layout/components';
import { ModalTrigger, Icon, Tip, EmptyState } from 'modules/common/components';
import { urlParser } from 'modules/common/utils';
import { CompanyChooser } from '../../containers';
import { CompanyWrapper } from '../../styles';

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
      <Icon icon="plus" />
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
CompanySection.defaultProps = defaultProps;

export default CompanySection;
