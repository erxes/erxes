import {
  EmptyState,
  Icon,
  ModalTrigger,
  Spinner
} from 'modules/common/components';
import { __, renderFullName } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import { Sidebar } from 'modules/layout/components';
import { SectionBody, SectionBodyItem } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { CustomerChooser } from '../../containers';

type Props = {
  name: string;
  customers: ICustomer[];
  onSelect: (customers: ICustomer[]) => void;
};

function CustomerSection({ name, customers, onSelect }: Props) {
  const { Section } = Sidebar;
  const { Title, QuickButtons } = Section;

  const mailTo = email => {
    if (email) {
      return <a href={`mailto:${email}`}>{email}</a>;
    }
    return null;
  };

  const renderBody = (customersObj: ICustomer[]) => {
    if (!customersObj) {
      return <Spinner objective={true} />;
    }

    return (
      <SectionBody>
        {customersObj.map((customer, index) => (
          <SectionBodyItem key={index}>
            <Link to={`/contacts/customers/details/${customer._id}`}>
              <Icon icon="logout-2" />
            </Link>
            <span>{renderFullName(customer)}</span>
            {mailTo(customer.primaryEmail)}
            <span>{customer.primaryPhone}</span>
          </SectionBodyItem>
        ))}
        {customersObj.length === 0 && (
          <EmptyState icon="user-5" text="No customer" />
        )}
      </SectionBody>
    );
  };

  const customerChooser = props => {
    return (
      <CustomerChooser
        {...props}
        data={{ name, customers }}
        onSelect={onSelect}
      />
    );
  };

  return (
    <Section>
      <Title>{__('Customers')}</Title>

      <QuickButtons>
        <ModalTrigger
          title="Associate"
          size="lg"
          trigger={
            <a href="#add">
              <Icon icon="add" />
            </a>
          }
          content={customerChooser}
        />
      </QuickButtons>

      {renderBody(customers)}
    </Section>
  );
}

export default CustomerSection;
