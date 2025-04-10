import { __, urlParser } from '@erxes/ui/src/utils';

import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import { SectionBodyItem } from '@erxes/ui/src/layout/styles';
import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { IContract } from '../../types';
import ContactsForm from '../../containers/detail/ContactsForm';

type Props = {
  companies?: ICompany[];
  title?: string;
  contract: IContract;
};

function CompanySection(this: any, { companies = [], title, contract }: Props) {
  const renderExternaleWebsite = (links) => {
    if (!links || !links.website) {
      return null;
    }

    return (
      <span>
        <a href={links.website} target="_blank" rel="noopener noreferrer">
          {urlParser.extractRootDomain(links.website)}
        </a>
      </span>
    );
  };

  const content = (
    <div>
      {companies.map((company) => (
        <SectionBodyItem key={company._id}>
          <Link to={`/companies/details/${company._id}`}>
            {company.primaryName || 'Unknown'}
          </Link>
          {renderExternaleWebsite(company.links)}
        </SectionBodyItem>
      ))}
      {companies.length === 0 && (
        <EmptyState icon="building" text="No company" />
      )}
    </div>
  );

  const customerChooser = (props) => {
    return <ContactsForm {...props} contract={contract} />;
  };

  const extraButtons = (
    <ModalTrigger
      title="Associate"
      size="lg"
      trigger={
        <button>
          <Icon icon="plus-circle" />
        </button>
      }
      content={customerChooser}
    />
  );

  return (
    <Box
      title={__(`${title || 'Companies'}`)}
      name="showCompanies"
      extraButtons={extraButtons}
      isOpen={true}
    >
      {content}
    </Box>
  );
}

export default CompanySection;
