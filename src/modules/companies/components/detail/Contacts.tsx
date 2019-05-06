import { EmptyState, Icon, NameCard } from 'modules/common/components';
import { __, renderFullName } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { Contact } from 'modules/customers/styles';
import { Sidebar } from 'modules/layout/components';
import * as React from 'react';
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

        <Link to={`/contacts/customers/details/${customer._id}`}>
          <Icon icon="logout-2" />
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
    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Section>
        <Title>{__('Contacts')}</Title>

        {this.renderContent()}
      </Section>
    );
  }
}

export default Contacts;
