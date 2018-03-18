import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Sidebar } from 'modules/layout/components';
import { ModalTrigger, Icon } from 'modules/common/components';
import { CustomerAssociate } from 'modules/customers/containers';
import { CustomersWrapper, CustomerWrapper } from '../../styles';

const propTypes = {
  company: PropTypes.object.isRequired
};

function CustomerSection({ company }, { __ }) {
  const { Section } = Sidebar;
  const { Title, QuickButtons } = Section;

  const renderFullName = customer => {
    if (customer.firstName || customer.lastName) {
      return (customer.firstName || '') + ' ' + (customer.lastName || '');
    }
    return customer.email || customer.phone || 'N/A';
  };

  return (
    <Section>
      <Title>{__('Customers')}</Title>

      <QuickButtons>
        <ModalTrigger
          title="Associate"
          size="lg"
          trigger={<Icon icon="plus" />}
        >
          <CustomerAssociate data={company} />
        </ModalTrigger>
      </QuickButtons>
      <CustomersWrapper>
        {company.customers.map((customer, index) => (
          <CustomerWrapper key={index}>
            <Link to={`/customers/details/${customer._id}`}>
              <Icon icon="android-arrow-forward" />
            </Link>
            <span>{__('Name')}: </span>
            <span>{renderFullName(customer)}</span>
          </CustomerWrapper>
        ))}
      </CustomersWrapper>
    </Section>
  );
}

CustomerSection.propTypes = propTypes;
CustomerSection.contextTypes = {
  __: PropTypes.func
};

export default CustomerSection;
