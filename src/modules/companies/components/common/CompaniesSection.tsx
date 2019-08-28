import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { __, urlParser } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import Sidebar from 'modules/layout/components/Sidebar';
import {
  ButtonRelated,
  SectionBody,
  SectionBodyItem
} from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import CompanyChooser from '../../containers/CompanyChooser';

type Props = {
  name: string;
  items?: ICompany[];
  mainType?: string;
  mainTypeId?: string;
  isOpen?: boolean;
};

function CompanySection({
  name,
  items = [],
  mainType = '',
  mainTypeId = '',
  isOpen
}: Props) {
  const { Section } = Sidebar;
  const { Title, QuickButtons } = Section;

  const renderCompanyChooser = props => {
    return (
      <CompanyChooser
        {...props}
        data={{ name, companies: items, mainType, mainTypeId }}
      />
    );
  };

  const renderRelatedCompanyChooser = props => {
    return (
      <CompanyChooser
        {...props}
        data={{ name, companies: items, mainTypeId, mainType, isRelated: true }}
      />
    );
  };

  const companyTrigger = (
    <button>
      <Icon icon="add" />
    </button>
  );

  const relCompanyTrigger = (
    <ButtonRelated>
      <button>{__('See related companies..')}</button>
    </ButtonRelated>
  );

  const quickButtons = (
    <ModalTrigger
      title="Associate"
      trigger={companyTrigger}
      size="lg"
      content={renderCompanyChooser}
    />
  );

  const relQuickButtons = (
    <ModalTrigger
      title="Related Associate"
      trigger={relCompanyTrigger}
      size="lg"
      content={renderRelatedCompanyChooser}
    />
  );

  const content = (
    <SectionBody>
      {items.map((company, index) => (
        <SectionBodyItem key={index}>
          <Link to={`/contacts/companies/details/${company._id}`}>
            <Icon icon="logout-2" />
          </Link>
          <span>{company.primaryName || 'Unknown'}</span>
          <Tip text={company.website || ''}>
            <a href={`//${company.website}`}>
              {urlParser.extractRootDomain(company.website || '')}
            </a>
          </Tip>
        </SectionBodyItem>
      ))}
      {items.length === 0 && <EmptyState icon="briefcase" text="No company" />}
      {mainTypeId && mainType && relQuickButtons}
    </SectionBody>
  );

  return (
    <Section>
      <Title>{__('Companies')}</Title>

      <QuickButtons isSidebarOpen={isOpen}>{quickButtons}</QuickButtons>

      {content}
    </Section>
  );
}

export default CompanySection;
