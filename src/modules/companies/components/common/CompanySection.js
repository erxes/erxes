import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ModalTrigger, Icon, Tip, EmptyState } from 'modules/common/components';
import { urlParser } from 'modules/common/utils';
import { CompanyChooser } from '../../containers';
import { SectionBody, SectionBodyItem } from 'modules/customers/styles';
import { BaseSection } from 'modules/common/components';

const propTypes = {
  name: PropTypes.string,
  companies: PropTypes.array,
  onSelect: PropTypes.func
};

const defaultProps = {
  companies: []
};

function CompanySection({ name, companies, onSelect }, { __ }) {
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
  );

  return (
    <BaseSection
      title={__('Companies')}
      content={content}
      quickButtons={quickButtons}
      isUseCustomer={true}
      name="showCompany"
    />
  );
}

CompanySection.propTypes = propTypes;
CompanySection.contextTypes = {
  __: PropTypes.func
};
CompanySection.defaultProps = defaultProps;

export default CompanySection;
