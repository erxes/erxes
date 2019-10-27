// import Box from 'modules/common/components/Box';
import Box from 'modules/common/components/Box';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { __, urlParser } from 'modules/common/utils';
import GetConformity from 'modules/conformity/containers/GetConformity';
// import { KnowledgeForm } from 'modules/knowledgeBase/components/knowledge';
import Sidebar from 'modules/layout/components/Sidebar';
import {
  ButtonRelated,
  SectionBody,
  SectionBodyItem
} from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import CompanyChooser from '../../containers/CompanyChooser';
import { queries } from '../../graphql';
import { ICompany } from '../../types';

type Props = {
  name: string;
  items?: ICompany[];
  mainType?: string;
  mainTypeId?: string;
  isOpen?: boolean;
  onSelect?: (companies: ICompany[]) => void;
};

function Component(
  this: any,
  { name, items = [], mainType = '', mainTypeId = '', isOpen, onSelect }: Props
) {
  const { Section } = Sidebar;
  const { QuickButtons } = Section;

  const renderCompanyChooser = props => {
    return (
      <CompanyChooser
        {...props}
        data={{ name, companies: items, mainType, mainTypeId }}
        onSelect={onSelect}
      />
    );
  };

  const renderRelatedCompanyChooser = props => {
    return (
      <CompanyChooser
        {...props}
        data={{ name, companies: items, mainTypeId, mainType, isRelated: true }}
        onSelect={onSelect}
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

  const extraButtons = (
    <QuickButtons isSidebarOpen={isOpen}>{quickButtons}</QuickButtons>
  );

  return (
    <Box extraButtons={extraButtons} title={__('Companies')} isOpen={false}>
      <Section>{content}</Section>
    </Box>
  );
}

type IProps = {
  mainType?: string;
  mainTypeId?: string;
  isOpen?: boolean;
  onSelect?: (datas: ICompany[]) => void;
};

export default (props: IProps) => {
  return (
    <GetConformity
      {...props}
      relType="company"
      component={Component}
      queryName="companies"
      itemsQuery={queries.companies}
    />
  );
};
