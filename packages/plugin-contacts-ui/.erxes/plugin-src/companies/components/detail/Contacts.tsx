import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { __, renderFullName } from '@erxes/ui/src/utils';
import { ICompany } from '@erxes/ui/src/companies/types';
import { Contact } from '@erxes/ui-contacts/src/customers/styles';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  companies: ICompany[];
  customerId: string;
};

class Contacts extends React.Component<Props> {
  renderContacts(users) {
    const { customerId } = this.props;
    const customers = users.filter(user => user._id !== customerId);

    return customers.map(customer => (
      <Contact key={customer._id}>
        <NameCard.Avatar customer={customer} size={30} />
        {renderFullName(customer)}

        <Link to={`/contacts/details/${customer._id}`}>
          <Icon icon="arrow-to-right" />
        </Link>
      </Contact>
    ));
  }

  renderContent() {
    const { companies } = this.props;

    if (!companies) {
      return <EmptyState icon="user-1" text="No contacts" />;
    }

    const customers = companies.map(company => company.customers);

    return customers.map(users => this.renderContacts(users));
  }

  render() {
    return (
      <Box title={__('Contacts')} name="showContacts">
        {this.renderContent()}
      </Box>
    );
  }
}

export default Contacts;
