import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Sidebar } from 'modules/layout/components';
import { ModalTrigger, Icon, EmptyState } from 'modules/common/components';
import { renderFullName } from 'modules/common/utils';
import { CustomerChooser } from '../../containers';
import { SectionBody, SectionBodyItem } from '../../styles';

const propTypes = {
  name: PropTypes.string,
  customers: PropTypes.array,
  onSelect: PropTypes.func
};

const defaultProps = {
  customers: []
};

function CustomerSection({ name, customers, onSelect }, { __ }) {
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
        >
          <CustomerChooser data={{ name, customers }} onSelect={onSelect} />
        </ModalTrigger>
      </QuickButtons>
      <SectionBody>
        {customers.map((customer, index) => (
          <SectionBodyItem key={index}>
            <Link to={`/customers/details/${customer._id}`}>
              <Icon icon="logout-2" />
            </Link>
            <span>{renderFullName(customer)}</span>
            {mailTo(customer.email)}
          </SectionBodyItem>
        ))}
        {customers.length === 0 && (
          <EmptyState icon="user-5" text="No customer" />
        )}
      </SectionBody>
    </Section>
  );
}

CustomerSection.propTypes = propTypes;
CustomerSection.contextTypes = {
  __: PropTypes.func
};
CustomerSection.defaultProps = defaultProps;

export default CustomerSection;
