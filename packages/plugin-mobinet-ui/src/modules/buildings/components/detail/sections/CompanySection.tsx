import {
  __,
  EmptyState,
  Icon,
  ModalTrigger,
  SectionBodyItem
} from '@erxes/ui/src';
import Box from '@erxes/ui/src/components/Box';
import { ButtonRelated } from '@erxes/ui/src/styles/main';
import { renderFullName } from '@erxes/ui/src/utils/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { renderCompanyName } from '../../../../../utils';

import ContactChooser from '../../../containers/ContactChooser';
import { IBuilding } from '../../../types';

type Props = {
  building: IBuilding;
  collapseCallback?: () => void;
  onSelectCompanies: (datas: any) => void;
};

const CompanySection = (props: Props) => {
  const { building, collapseCallback, onSelectCompanies } = props;
  const { companies } = building;
  const renderCustomerChooser = props => {
    return (
      <ContactChooser
        {...props}
        onSelect={onSelectCompanies}
        building={building}
        contacts={companies}
        contactType="companies"
      />
    );
  };

  const renderRelatedCustomerChooser = props => {
    return (
      <ContactChooser
        {...props}
        contactType="companies"
        data={{
          name: 'Related companies',
          customers: [],
          isRelated: true
        }}
      />
    );
  };

  const customerTrigger = (
    <button>
      <Icon icon="plus-circle" />
    </button>
  );

  const relCustomerTrigger = (
    <ButtonRelated>
      <span>{__('See related companies..')}</span>
    </ButtonRelated>
  );

  const quickButtons = (
    <ModalTrigger
      title="Add company"
      trigger={customerTrigger}
      size="lg"
      content={renderCustomerChooser}
    />
  );

  const relQuickButtons = (
    <ModalTrigger
      title="Add related company"
      trigger={relCustomerTrigger}
      size="lg"
      content={renderRelatedCustomerChooser}
    />
  );

  const content = (
    <>
      {companies.map((company, index) => (
        <SectionBodyItem key={index}>
          <Link to={`/companies/details/${company._id}`}>
            <span>{renderCompanyName(company)}</span>
          </Link>
        </SectionBodyItem>
      ))}
      {companies.length === 0 && (
        <EmptyState icon="building" text="No companies" />
      )}
      {relQuickButtons}
    </>
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
};

export default CompanySection;
