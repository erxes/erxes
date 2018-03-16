import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Sidebar } from 'modules/layout/components';
import { ModalTrigger, Icon } from 'modules/common/components';
import { renderFullName } from 'modules/common/utils';
import { CustomerAssociate } from 'modules/customers/containers';
import { ManageGroups } from 'modules/settings/properties/components';
import { CustomersWrapper, CustomerWrapper } from '../../styles';
import { TaggerSection } from 'modules/customers/components/detail/sidebar';
import BasicInfo from './BasicInfo';

const propTypes = {
  company: PropTypes.object.isRequired,
  fieldsGroups: PropTypes.array.isRequired,
  customFieldsData: PropTypes.object
};

class LeftSidebar extends ManageGroups {
  renderCustomers() {
    const { company } = this.props;
    const { Section } = Sidebar;
    const { Title, QuickButtons } = Section;
    const { __ } = this.context;

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

  render() {
    const { company } = this.props;

    return (
      <Sidebar wide>
        <BasicInfo company={company} />
        {this.renderGroups(company)}
        {this.renderCustomers()}
        <TaggerSection data={company} type="company" />
      </Sidebar>
    );
  }
}

LeftSidebar.propTypes = propTypes;
LeftSidebar.contextTypes = {
  __: PropTypes.func
};

export default LeftSidebar;
