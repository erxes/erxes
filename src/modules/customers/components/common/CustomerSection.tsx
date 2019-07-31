import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Spinner from 'modules/common/components/Spinner';
import { __, renderFullName } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import Sidebar from 'modules/layout/components/Sidebar';
import { SectionBody, SectionBodyItem } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import CustomerChooser from '../../containers/CustomerChooser';

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
      return (
        <a target="_parent" href={`mailto:${email}`} rel="noopener noreferrer">
          {email}
        </a>
      );
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
            <button>
              <Icon icon="add" />
            </button>
          }
          content={customerChooser}
        />
      </QuickButtons>

      {renderBody(customers)}
    </Section>
  );
}

export default CustomerSection;
