import { EmptyState, Icon, ModalTrigger } from 'modules/common/components';
import { __, renderFullName } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import { Sidebar } from 'modules/layout/components';
import { SectionBody, SectionBodyItem } from 'modules/layout/styles';
import * as React from 'react';
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
      return (
        <a target="_blank" href={`mailto:${email}`}>
          {email}
        </a>
      );
    }
    return null;
  };

  return (
    <Section>
      <Title>{__('Customers')}</Title>

      <QuickButtons>
        <ModalTrigger
          title="Associate"
          size="lg"
          trigger={
            <a>
              <Icon icon="add" />
            </a>
          }
          content={props => (
            <CustomerChooser
              {...props}
              data={{ name, customers }}
              onSelect={onSelect}
            />
          )}
        />
      </QuickButtons>

      <SectionBody>
        {customers.map((customer, index) => (
          <SectionBodyItem key={index}>
            <Link to={`/customers/details/${customer._id}`}>
              <Icon icon="logout-2" />
            </Link>
            <span>{renderFullName(customer)}</span>
            {mailTo(customer.primaryEmail)}
            <span>{customer.primaryPhone}</span>
          </SectionBodyItem>
        ))}
        {customers.length === 0 && (
          <EmptyState icon="user-5" text="No customer" />
        )}
      </SectionBody>
    </Section>
  );
}

export default CustomerSection;
