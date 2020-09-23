import Box from 'modules/common/components/Box';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { ButtonRelated } from 'modules/common/styles/main';
import { __, urlParser } from 'modules/common/utils';
import GetConformity from 'modules/conformity/containers/GetConformity';
import { SectionBodyItem } from 'modules/layout/styles';
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
  onSelect?: (companies: ICompany[]) => void;
  collapseCallback?: () => void;
};

function Component(
  this: any,
  {
    name,
    items = [],
    mainType = '',
    mainTypeId = '',
    onSelect,
    collapseCallback
  }: Props
) {
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
      <Icon icon="plus-circle" />
    </button>
  );

  const relCompanyTrigger = (
    <ButtonRelated>
      <span>{__('See related companies')}</span>
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

  const renderExternaleWebsite = (links) => {
    if (!links || !links.website) {
      return null;
    }

    return (
      <span>
        <a href={links.website} target="_blank" rel="noopener noreferrer">
          {urlParser.extractRootDomain(links.website || '')}
        </a>
      </span>
    )
  }

  const content = (
    <div>
      {items.map((company, index) => (
        <SectionBodyItem key={index}>
          <Link to={`/companies/details/${company._id}`}>
            {company.primaryName || 'Unknown'}
          </Link>
          {renderExternaleWebsite(company.links)}
        </SectionBodyItem>
      ))}
      {items.length === 0 && <EmptyState icon="building" text="No company" />}
      {mainTypeId && mainType && relQuickButtons}
    </div>
  );

  return (
    <Box
      title={__('Companies')}
      name="showCompanies"
      extraButtons={quickButtons}
      isOpen={true}
      callback={collapseCallback}
    >
      {content}
    </Box>
  );
}

type IProps = {
  mainType?: string;
  mainTypeId?: string;
  isOpen?: boolean;
  companies?: ICompany[];
  onSelect?: (datas: ICompany[]) => void;
  collapseCallback?: () => void;
};

export default (props: IProps) => {
  return (
    <GetConformity
      {...props}
      relType="company"
      component={Component}
      queryName="companies"
      itemsQuery={queries.companies}
      alreadyItems={props.companies}
    />
  );
};
