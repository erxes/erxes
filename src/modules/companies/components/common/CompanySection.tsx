import { EmptyState, Icon, ModalTrigger, Tip } from 'modules/common/components';
import { __, urlParser } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { Sidebar } from 'modules/layout/components';
import { SectionBody, SectionBodyItem } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { CompanyChooser } from '../../containers';

type Props = {
  name: string;
  companies?: ICompany[];
  onSelect: (companies: ICompany[]) => void;
  isOpen?: boolean;
};

function CompanySection({ name, companies = [], onSelect, isOpen }: Props) {
  const { Section } = Sidebar;
  const { Title, QuickButtons } = Section;

  const renderCompanyChooser = props => {
    return (
      <CompanyChooser
        {...props}
        data={{ name, companies }}
        onSelect={onSelect}
      />
    );
  };

  const companyTrigger = (
    <a href="#add">
      <Icon icon="add" />
    </a>
  );

  const quickButtons = (
    <ModalTrigger
      title="Associate"
      trigger={companyTrigger}
      size="lg"
      content={renderCompanyChooser}
    />
  );

  const content = (
    <SectionBody>
      {companies.map((company, index) => (
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
      {companies.length === 0 && (
        <EmptyState icon="briefcase" text="No company" />
      )}
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
