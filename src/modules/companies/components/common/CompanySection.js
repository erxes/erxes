import * as React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ModalTrigger, Icon, Tip, EmptyState } from 'modules/common/components';
import { urlParser } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { SectionBody, SectionBodyItem } from 'modules/layout/styles';
import { CompanyChooser } from '../../containers';

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
  const { Title, QuickButtons } = Section;

  const companyTrigger = (
    <a>
      <Icon icon="add" />
    </a>
  );

  const quickButtons = (
    <ModalTrigger title="Associate" trigger={companyTrigger} size="lg">
      <CompanyChooser data={{ name, companies }} onSelect={onSelect} />
    </ModalTrigger>
  );

  const content = (
    <SectionBody>
      {companies.map((company, index) => (
        <SectionBodyItem key={index}>
          <Link to={`/companies/details/${company._id}`}>
            <Icon icon="logout-2" />
          </Link>
          <span>{company.primaryName || 'N/A'}</span>
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
  );

  return (
    <Section>
      <Title>{__('Companies')}</Title>

      <QuickButtons>{quickButtons}</QuickButtons>

      {content}
    </Section>
  );
}

CompanySection.propTypes = propTypes;
CompanySection.contextTypes = {
  __: PropTypes.func
};
CompanySection.defaultProps = defaultProps;

export default CompanySection;
